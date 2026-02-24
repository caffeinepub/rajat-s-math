import React, { useState } from 'react';
import { CheckCircle, Clock, AlertCircle, User, Phone, BookOpen, Calendar, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useGetBookingRecords, useMarkAsPaid, useIsCallerAdmin } from '../hooks/useQueries';
import type { BookingRecord } from '../backend';
import { BookingStatus } from '../backend';

interface AdminDashboardProps {
  onBack: () => void;
}

function BookingCard({ record, onMarkPaid, isMarking }: {
  record: BookingRecord;
  onMarkPaid?: (id: string) => void;
  isMarking?: boolean;
}) {
  const statusConfig = {
    [BookingStatus.pending]: {
      label: 'Pending',
      icon: <AlertCircle className="w-3 h-3" />,
      className: 'bg-gray-100 text-gray-700 border-gray-300',
    },
    [BookingStatus.awaitingPayment]: {
      label: 'Awaiting Payment',
      icon: <Clock className="w-3 h-3" />,
      className: 'bg-amber-100 text-amber-700 border-amber-300',
    },
    [BookingStatus.completed]: {
      label: 'Completed',
      icon: <CheckCircle className="w-3 h-3" />,
      className: 'bg-green-100 text-green-700 border-green-300',
    },
  };

  const statusKey = record.status as BookingStatus;
  const config = statusConfig[statusKey] ?? statusConfig[BookingStatus.pending];

  const confirmedAt = record.paymentConfirmedAt
    ? new Date(Number(record.paymentConfirmedAt) / 1_000_000).toLocaleString('en-IN')
    : null;

  return (
    <div className="bg-white border border-border-warm rounded-xl p-4 space-y-3 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-navy/10 flex items-center justify-center">
            <User className="w-4 h-4 text-navy" />
          </div>
          <div>
            <p className="font-semibold text-navy text-sm">{record.name}</p>
            <p className="text-xs text-muted-foreground font-mono">{record.paymentId}</p>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${config.className}`}>
          {config.icon}
          {config.label}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-warm-text">
          <BookOpen className="w-3 h-3 text-navy/60 flex-shrink-0" />
          <span className="truncate">{record.service}</span>
        </div>
        <div className="flex items-center gap-1.5 text-warm-text">
          <Phone className="w-3 h-3 text-navy/60 flex-shrink-0" />
          <span>{record.phone}</span>
        </div>
        <div className="flex items-center gap-1.5 text-warm-text">
          <Calendar className="w-3 h-3 text-navy/60 flex-shrink-0" />
          <span>{record.date}</span>
        </div>
        <div className="flex items-center gap-1.5 text-warm-text">
          <Clock className="w-3 h-3 text-navy/60 flex-shrink-0" />
          <span>{record.time}</span>
        </div>
      </div>

      {confirmedAt && (
        <p className="text-xs text-green-600 font-medium">
          ✓ Payment confirmed on {confirmedAt}
        </p>
      )}

      {statusKey === BookingStatus.awaitingPayment && onMarkPaid && (
        <Button
          size="sm"
          onClick={() => onMarkPaid(record.paymentId)}
          disabled={isMarking}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg"
        >
          {isMarking ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Confirming...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Mark as Paid ✓
            </>
          )}
        </Button>
      )}
    </div>
  );
}

export function AdminDashboard({ onBack }: AdminDashboardProps) {
  const { data: bookings, isLoading, error } = useGetBookingRecords();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const markAsPaid = useMarkAsPaid();
  const [markingId, setMarkingId] = useState<string | null>(null);

  const handleMarkPaid = async (bookingId: string) => {
    setMarkingId(bookingId);
    try {
      const success = await markAsPaid.mutateAsync(bookingId);
      if (success) {
        toast.success('Booking marked as paid and completed!');
      } else {
        toast.error('Could not mark as paid. Booking may not be in awaiting payment status.');
      }
    } catch (err) {
      toast.error('Failed to mark as paid. Please try again.');
    } finally {
      setMarkingId(null);
    }
  };

  if (adminLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream to-warm-light py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-6 w-64" />
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream to-warm-light flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-navy font-serif">Access Denied</h2>
          <p className="text-warm-text">You do not have admin privileges to access this dashboard.</p>
          <Button onClick={onBack} variant="outline" className="border-navy text-navy hover:bg-navy hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream to-warm-light flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-bold text-navy">Failed to load bookings</h2>
          <p className="text-warm-text text-sm">Please try refreshing the page.</p>
          <Button onClick={onBack} variant="outline" className="border-navy text-navy hover:bg-navy hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const allBookings = bookings ?? [];
  const pending = allBookings.filter((b) => b.status === BookingStatus.pending);
  const awaitingPayment = allBookings.filter((b) => b.status === BookingStatus.awaitingPayment);
  const completed = allBookings.filter((b) => b.status === BookingStatus.completed);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream to-warm-light">
      {/* Header */}
      <div className="bg-navy text-white py-6 px-4 shadow-lg">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-white hover:bg-white/20 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold font-serif">Admin Dashboard</h1>
              <p className="text-white/70 text-sm">Manage tutoring session bookings</p>
            </div>
          </div>
          <div className="flex gap-3 text-center">
            <div className="bg-white/10 rounded-lg px-3 py-2">
              <p className="text-xl font-bold">{allBookings.length}</p>
              <p className="text-xs text-white/70">Total</p>
            </div>
            <div className="bg-amber-500/30 rounded-lg px-3 py-2">
              <p className="text-xl font-bold">{awaitingPayment.length}</p>
              <p className="text-xs text-white/70">Awaiting</p>
            </div>
            <div className="bg-green-500/30 rounded-lg px-3 py-2">
              <p className="text-xl font-bold">{completed.length}</p>
              <p className="text-xs text-white/70">Completed</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
        {/* Awaiting Payment Section */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <h2 className="text-xl font-bold text-navy font-serif">
              Awaiting Payment Verification
              {awaitingPayment.length > 0 && (
                <Badge className="ml-2 bg-amber-500 text-white text-xs">{awaitingPayment.length}</Badge>
              )}
            </h2>
          </div>
          {awaitingPayment.length === 0 ? (
            <Card className="border-dashed border-2 border-amber-200 bg-amber-50/50">
              <CardContent className="py-8 text-center text-amber-600/70">
                No bookings awaiting payment verification.
              </CardContent>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {awaitingPayment.map((record, idx) => (
                <BookingCard
                  key={`awaiting-${idx}`}
                  record={record}
                  onMarkPaid={handleMarkPaid}
                  isMarking={markingId === record.paymentId}
                />
              ))}
            </div>
          )}
        </section>

        {/* Pending Section */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-gray-500" />
            </div>
            <h2 className="text-xl font-bold text-navy font-serif">
              Pending
              {pending.length > 0 && (
                <Badge className="ml-2 bg-gray-500 text-white text-xs">{pending.length}</Badge>
              )}
            </h2>
          </div>
          {pending.length === 0 ? (
            <Card className="border-dashed border-2 border-gray-200 bg-gray-50/50">
              <CardContent className="py-8 text-center text-gray-400">
                No pending bookings.
              </CardContent>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {pending.map((record, idx) => (
                <BookingCard key={`pending-${idx}`} record={record} />
              ))}
            </div>
          )}
        </section>

        {/* Completed Section */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-navy font-serif">
              Completed
              {completed.length > 0 && (
                <Badge className="ml-2 bg-green-600 text-white text-xs">{completed.length}</Badge>
              )}
            </h2>
          </div>
          {completed.length === 0 ? (
            <Card className="border-dashed border-2 border-green-200 bg-green-50/50">
              <CardContent className="py-8 text-center text-green-600/70">
                No completed bookings yet.
              </CardContent>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {completed.map((record, idx) => (
                <BookingCard key={`completed-${idx}`} record={record} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
