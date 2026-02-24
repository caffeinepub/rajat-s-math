import React, { useState } from 'react';
import {
  useGetBookingRecords,
  useMarkAsPaid,
  useConfirmPaymentAndGenerateAccessCode,
  useDeleteBooking,
} from '../hooks/useQueries';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { BookingRecord } from '../backend';
import {
  CheckCircle,
  Clock,
  Trash2,
  Key,
  ChevronDown,
  ChevronUp,
  CalendarDays,
  Tag,
  Eye,
  BookOpen,
  Calendar,
  MessageSquare,
} from 'lucide-react';
import { toast } from 'sonner';
import StudentMaterialsTab from './StudentMaterialsTab';
import StudentScheduleTab from './StudentScheduleTab';
import AdminSupportMessages from './AdminSupportMessages';
import AttendanceManager from './AttendanceManager';
import DiscountCodeManager from './DiscountCodeManager';
import VisitorTrackingView from './VisitorTrackingView';

function formatDate(timestamp: bigint | undefined): string {
  if (!timestamp) return 'N/A';
  const ms = Number(timestamp / BigInt(1_000_000));
  return new Date(ms).toLocaleString('en-IN');
}

function BookingCard({ booking }: { booking: BookingRecord }) {
  const markAsPaid = useMarkAsPaid();
  const confirmPayment = useConfirmPaymentAndGenerateAccessCode();
  const deleteBooking = useDeleteBooking();
  const [expanded, setExpanded] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);

  const handleMarkPaid = async () => {
    try {
      await markAsPaid.mutateAsync(booking.paymentId);
      toast.success('Booking marked as paid');
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to mark as paid');
    }
  };

  const handleConfirmAndGenerate = async () => {
    try {
      const code = await confirmPayment.mutateAsync(booking.paymentId);
      if (code) {
        setGeneratedCode(code);
        toast.success(`Access code generated: ${code}`);
      }
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to confirm payment');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this booking?')) return;
    try {
      await deleteBooking.mutateAsync(booking.paymentId);
      toast.success('Booking deleted');
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to delete booking');
    }
  };

  const statusColorMap: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    awaitingPayment: 'bg-blue-100 text-blue-700 border-blue-200',
    completed: 'bg-green-100 text-green-700 border-green-200',
  };
  const statusColor = statusColorMap[booking.status] ?? 'bg-gray-100 text-gray-700';

  return (
    <Card className="border-border-warm">
      <CardContent className="pt-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-navy">{booking.name}</h3>
              <Badge variant="outline" className={statusColor}>
                {booking.status}
              </Badge>
              {booking.discountApplied > 0 && (
                <Badge variant="outline" className="bg-gold/10 text-gold border-gold/30">
                  {booking.discountApplied}% OFF
                </Badge>
              )}
            </div>
            <p className="text-sm text-warm-text">{booking.service}</p>
            <p className="text-xs text-warm-text">
              {booking.date} at {booking.time} · {booking.phone}
            </p>
            <p className="text-xs text-warm-text">
              {booking.classType === 'oneOnOne' ? '1-on-1' : 'Group'} ·{' '}
              {booking.numberOfClasses.toString()} classes · ₹{booking.finalAmount.toString()}
            </p>
            {booking.accessCode && (
              <p className="text-xs font-mono bg-green-50 text-green-700 px-2 py-1 rounded inline-block">
                Access: {booking.accessCode}
              </p>
            )}
            {generatedCode && (
              <p className="text-xs font-mono bg-blue-50 text-blue-700 px-2 py-1 rounded inline-block">
                New Code: {generatedCode}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {booking.status === 'awaitingPayment' && (
              <>
                <Button
                  size="sm"
                  onClick={handleMarkPaid}
                  disabled={markAsPaid.isPending}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {markAsPaid.isPending ? 'Saving...' : 'Mark Paid'}
                </Button>
                <Button
                  size="sm"
                  onClick={handleConfirmAndGenerate}
                  disabled={confirmPayment.isPending}
                  className="bg-navy text-cream hover:bg-navy/90"
                >
                  <Key className="w-3 h-3 mr-1" />
                  {confirmPayment.isPending ? 'Generating...' : 'Confirm + Code'}
                </Button>
              </>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDelete}
              disabled={deleteBooking.isPending}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setExpanded(!expanded)}
              className="text-warm-text"
            >
              {expanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {expanded && (
          <div className="mt-4 space-y-4 border-t border-border-warm pt-4">
            <div>
              <p className="text-xs font-semibold text-warm-text uppercase tracking-wide mb-2">
                Payment Info
              </p>
              <p className="text-xs text-warm-text">ID: {booking.paymentId}</p>
              <p className="text-xs text-warm-text">Status: {booking.paymentStatus}</p>
              {booking.paymentConfirmedAt && (
                <p className="text-xs text-warm-text">
                  Confirmed: {formatDate(booking.paymentConfirmedAt)}
                </p>
              )}
            </div>
            <StudentMaterialsTab courseName={booking.service} />
            <StudentScheduleTab courseName={booking.service} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const { data: bookings, isLoading } = useGetBookingRecords();

  const pending = bookings?.filter((b) => b.status === 'pending') ?? [];
  const awaiting = bookings?.filter((b) => b.status === 'awaitingPayment') ?? [];
  const completed = bookings?.filter((b) => b.status === 'completed') ?? [];

  return (
    <div className="min-h-screen bg-cream p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-navy font-serif">Admin Dashboard</h1>
          <p className="text-warm-text text-sm mt-1">
            Manage bookings, materials, sessions, and more
          </p>
        </div>

        <Tabs defaultValue="bookings">
          <TabsList className="flex flex-wrap h-auto gap-1 mb-6 bg-warm-light/50 p-1 rounded-lg">
            <TabsTrigger value="bookings" className="text-xs sm:text-sm">
              Bookings
            </TabsTrigger>
            <TabsTrigger
              value="materials"
              className="text-xs sm:text-sm flex items-center gap-1"
            >
              <BookOpen className="w-3 h-3" /> Course Materials
            </TabsTrigger>
            <TabsTrigger
              value="sessions"
              className="text-xs sm:text-sm flex items-center gap-1"
            >
              <Calendar className="w-3 h-3" /> Class Schedule
            </TabsTrigger>
            <TabsTrigger
              value="support"
              className="text-xs sm:text-sm flex items-center gap-1"
            >
              <MessageSquare className="w-3 h-3" /> Support
            </TabsTrigger>
            <TabsTrigger
              value="attendance"
              className="text-xs sm:text-sm flex items-center gap-1"
            >
              <CalendarDays className="w-3 h-3" /> Attendance
            </TabsTrigger>
            <TabsTrigger
              value="discounts"
              className="text-xs sm:text-sm flex items-center gap-1"
            >
              <Tag className="w-3 h-3" /> Discounts
            </TabsTrigger>
            <TabsTrigger
              value="visitors"
              className="text-xs sm:text-sm flex items-center gap-1"
            >
              <Eye className="w-3 h-3" /> Visitors
            </TabsTrigger>
          </TabsList>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-4">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : (
              <>
                {awaiting.length > 0 && (
                  <div>
                    <h2 className="text-sm font-semibold text-warm-text uppercase tracking-wide mb-2 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Awaiting Payment ({awaiting.length})
                    </h2>
                    <div className="space-y-3">
                      {awaiting.map((b) => (
                        <BookingCard key={b.paymentId} booking={b} />
                      ))}
                    </div>
                  </div>
                )}
                {pending.length > 0 && (
                  <div>
                    <h2 className="text-sm font-semibold text-warm-text uppercase tracking-wide mb-2">
                      Pending ({pending.length})
                    </h2>
                    <div className="space-y-3">
                      {pending.map((b) => (
                        <BookingCard key={b.paymentId} booking={b} />
                      ))}
                    </div>
                  </div>
                )}
                {completed.length > 0 && (
                  <div>
                    <h2 className="text-sm font-semibold text-warm-text uppercase tracking-wide mb-2 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-green-600" /> Completed (
                      {completed.length})
                    </h2>
                    <div className="space-y-3">
                      {completed.map((b) => (
                        <BookingCard key={b.paymentId} booking={b} />
                      ))}
                    </div>
                  </div>
                )}
                {(!bookings || bookings.length === 0) && (
                  <div className="text-center py-12 text-warm-text">
                    <p>No bookings yet.</p>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* Course Materials Tab */}
          <TabsContent value="materials">
            <div className="space-y-4">
              <p className="text-sm text-warm-text">
                Manage course materials for each service/course.
              </p>
              <StudentMaterialsTab courseName="Comprehensive Mathematics Program" />
            </div>
          </TabsContent>

          {/* Class Schedule Tab */}
          <TabsContent value="sessions">
            <div className="space-y-4">
              <p className="text-sm text-warm-text">Manage class sessions and schedules.</p>
              <StudentScheduleTab courseName="Comprehensive Mathematics Program" />
            </div>
          </TabsContent>

          {/* Support Tab */}
          <TabsContent value="support">
            <AdminSupportMessages />
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="attendance">
            <AttendanceManager />
          </TabsContent>

          {/* Discount Codes Tab */}
          <TabsContent value="discounts">
            <DiscountCodeManager />
          </TabsContent>

          {/* Visitor Tracking Tab */}
          <TabsContent value="visitors">
            <VisitorTrackingView />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
