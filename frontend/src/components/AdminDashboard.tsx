import React, { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsCallerAdmin, useGetBookingRecords, useMarkAsPaid, useConfirmPaymentAndGenerateAccessCode, useDeleteBooking } from '../hooks/useQueries';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { BookingRecord, BookingStatus, ClassType } from '../backend';
import AttendanceManager from './AttendanceManager';
import AdminSupportMessages from './AdminSupportMessages';
import DiscountCodeManager from './DiscountCodeManager';
import CourseMaterialsManager from './CourseMaterialsManager';
import ClassSessionsManager from './ClassSessionsManager';
import VisitorTrackingView from './VisitorTrackingView';
import { Users, BookOpen, MessageSquare, Tag, Calendar, BarChart2, Shield, Loader2 } from 'lucide-react';

function BookingCard({ booking, onMarkPaid, onConfirmPayment, onDelete, isLoading }: {
  booking: BookingRecord;
  onMarkPaid: (id: string) => void;
  onConfirmPayment: (id: string) => void;
  onDelete: (id: string) => void;
  isLoading: boolean;
}) {
  const statusColor = {
    [BookingStatus.pending]: 'bg-yellow-100 text-yellow-800',
    [BookingStatus.awaitingPayment]: 'bg-blue-100 text-blue-800',
    [BookingStatus.completed]: 'bg-green-100 text-green-800',
  };

  const classTypeLabel = booking.classType === ClassType.oneOnOne ? 'One-on-One' : 'Group';

  return (
    <Card className="mb-4">
      <CardContent className="pt-4">
        <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
          <div>
            <h3 className="font-semibold text-foreground">{booking.name}</h3>
            <p className="text-sm text-muted-foreground">{booking.phone}</p>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[booking.status as BookingStatus] || 'bg-gray-100 text-gray-800'}`}>
            {booking.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm mb-3">
          <div><span className="text-muted-foreground">Service:</span> <span className="font-medium">{booking.service}</span></div>
          <div><span className="text-muted-foreground">Type:</span> <span className="font-medium">{classTypeLabel}</span></div>
          <div><span className="text-muted-foreground">Classes:</span> <span className="font-medium">{Number(booking.numberOfClasses)}</span></div>
          <div><span className="text-muted-foreground">Date:</span> <span className="font-medium">{booking.date}</span></div>
          <div><span className="text-muted-foreground">Time:</span> <span className="font-medium">{booking.time}</span></div>
          <div><span className="text-muted-foreground">Amount:</span> <span className="font-medium">₹{Number(booking.finalAmount)}</span></div>
          {booking.discountApplied > 0 && (
            <div><span className="text-muted-foreground">Discount:</span> <span className="font-medium text-green-600">{booking.discountApplied}%</span></div>
          )}
          {booking.accessCode && (
            <div className="col-span-2"><span className="text-muted-foreground">Access Code:</span> <span className="font-mono font-bold text-primary">{booking.accessCode}</span></div>
          )}
        </div>

        <div className="text-xs text-muted-foreground mb-3">
          Payment ID: <span className="font-mono">{booking.paymentId}</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {booking.status === BookingStatus.awaitingPayment && (
            <>
              <Button size="sm" onClick={() => onMarkPaid(booking.paymentId)} disabled={isLoading}>
                {isLoading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                Mark as Paid
              </Button>
              <Button size="sm" variant="outline" onClick={() => onConfirmPayment(booking.paymentId)} disabled={isLoading}>
                Confirm & Generate Code
              </Button>
            </>
          )}
          <Button size="sm" variant="destructive" onClick={() => onDelete(booking.paymentId)} disabled={isLoading}>
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function BookingsTab() {
  const { data: bookings, isLoading } = useGetBookingRecords();
  const markAsPaid = useMarkAsPaid();
  const confirmPayment = useConfirmPaymentAndGenerateAccessCode();
  const deleteBooking = useDeleteBooking();

  const [filter, setFilter] = useState<'all' | 'pending' | 'awaitingPayment' | 'completed'>('all');

  const filtered = (bookings ?? []).filter(b => {
    if (filter === 'all') return true;
    return b.status === filter;
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-40 w-full" />)}
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-2 mb-4 flex-wrap">
        {(['all', 'pending', 'awaitingPayment', 'completed'] as const).map(f => (
          <Button
            key={f}
            size="sm"
            variant={filter === f ? 'default' : 'outline'}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'All' : f === 'awaitingPayment' ? 'Awaiting Payment' : f.charAt(0).toUpperCase() + f.slice(1)}
            <Badge variant="secondary" className="ml-1">
              {f === 'all' ? (bookings ?? []).length : (bookings ?? []).filter(b => b.status === f).length}
            </Badge>
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No bookings found.
        </div>
      ) : (
        filtered.map(booking => (
          <BookingCard
            key={booking.paymentId}
            booking={booking}
            onMarkPaid={(id) => markAsPaid.mutate(id)}
            onConfirmPayment={(id) => confirmPayment.mutate(id)}
            onDelete={(id) => deleteBooking.mutate(id)}
            isLoading={markAsPaid.isPending || confirmPayment.isPending || deleteBooking.isPending}
          />
        ))
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: isAdminLoading } = useIsCallerAdmin();

  if (isAdminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!identity) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-8">
          <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-4">Authentication Required</h2>
          <p className="text-muted-foreground mb-6">Please log in to access the admin dashboard.</p>
          <a href="/" className="text-primary hover:underline">Return to Home</a>
        </div>
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-8">
          <Shield className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-4">Access Denied</h2>
          <p className="text-muted-foreground mb-6">You do not have admin privileges to view this page.</p>
          <a href="/" className="text-primary hover:underline">Return to Home</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground font-serif">Admin Dashboard</h1>
          </div>
          <p className="text-muted-foreground">
            Manage bookings, students, materials, and more.
          </p>
        </div>

        <Tabs defaultValue="bookings" className="w-full">
          <TabsList className="flex flex-wrap h-auto gap-1 mb-6 bg-muted p-1 rounded-lg">
            <TabsTrigger value="bookings" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Bookings</span>
            </TabsTrigger>
            <TabsTrigger value="materials" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Materials</span>
            </TabsTrigger>
            <TabsTrigger value="sessions" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Sessions</span>
            </TabsTrigger>
            <TabsTrigger value="attendance" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Attendance</span>
            </TabsTrigger>
            <TabsTrigger value="support" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Support</span>
            </TabsTrigger>
            <TabsTrigger value="discounts" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <Tag className="w-4 h-4" />
              <span className="hidden sm:inline">Discounts</span>
            </TabsTrigger>
            <TabsTrigger value="visitors" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <BarChart2 className="w-4 h-4" />
              <span className="hidden sm:inline">Visitors</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <CardTitle>Booking Records</CardTitle>
              </CardHeader>
              <CardContent>
                <BookingsTab />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="materials">
            <Card>
              <CardHeader>
                <CardTitle>Course Materials</CardTitle>
              </CardHeader>
              <CardContent>
                <CourseMaterialsManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sessions">
            <Card>
              <CardHeader>
                <CardTitle>Class Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <ClassSessionsManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attendance">
            <Card>
              <CardHeader>
                <CardTitle>Attendance Management</CardTitle>
              </CardHeader>
              <CardContent>
                <AttendanceManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="support">
            <Card>
              <CardHeader>
                <CardTitle>Support Messages</CardTitle>
              </CardHeader>
              <CardContent>
                <AdminSupportMessages />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="discounts">
            <Card>
              <CardHeader>
                <CardTitle>Discount Codes</CardTitle>
              </CardHeader>
              <CardContent>
                <DiscountCodeManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="visitors">
            <Card>
              <CardHeader>
                <CardTitle>Visitor Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <VisitorTrackingView />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
