import React, { useState } from 'react';
import { Principal } from '@dfinity/principal';
import { useGetBookingRecords, useGetAttendanceRecords, useGetAttendanceSummary, useMarkAttendance } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarDays, CheckCircle, XCircle, Plus } from 'lucide-react';
import { toast } from 'sonner';

function dateToNanoseconds(dateStr: string): bigint {
  const date = new Date(dateStr);
  return BigInt(date.getTime()) * BigInt(1_000_000);
}

function nanosecondsToDate(ns: bigint): string {
  const ms = Number(ns / BigInt(1_000_000));
  return new Date(ms).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function AttendanceManager() {
  const { data: bookings, isLoading: bookingsLoading } = useGetBookingRecords();
  const markAttendance = useMarkAttendance();

  const [selectedBookingId, setSelectedBookingId] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [queryEnabled, setQueryEnabled] = useState(false);

  // New session form
  const [newSessionDate, setNewSessionDate] = useState<string>('');
  const [newSessionPresent, setNewSessionPresent] = useState(true);
  // Manual principal input (string) — the hook accepts string and converts internally
  const [manualPrincipal, setManualPrincipal] = useState<string>('');

  const selectedBooking = bookings?.find(b => b.paymentId === selectedBookingId);

  // Parse principal for query hooks (they need Principal | null)
  const studentPrincipal: Principal | null = (() => {
    if (!manualPrincipal.trim()) return null;
    try { return Principal.fromText(manualPrincipal.trim()); } catch { return null; }
  })();

  const startNs = startDate ? dateToNanoseconds(startDate) : BigInt(0);
  const endNs = endDate ? dateToNanoseconds(endDate + 'T23:59:59') : BigInt(Date.now()) * BigInt(1_000_000);

  const { data: records, isLoading: recordsLoading } = useGetAttendanceRecords(
    studentPrincipal,
    selectedBooking?.service ?? '',
    startNs,
    endNs,
    queryEnabled && !!studentPrincipal
  );

  const { data: summary } = useGetAttendanceSummary(
    studentPrincipal,
    selectedBooking?.service ?? '',
    startNs,
    endNs,
    queryEnabled && !!studentPrincipal
  );

  const completedBookings = bookings?.filter(b => b.status === 'completed') ?? [];

  const handleSearch = () => {
    if (!selectedBookingId) {
      toast.error('Please select a student booking');
      return;
    }
    if (!studentPrincipal) {
      toast.error('Please enter a valid student principal ID');
      return;
    }
    setQueryEnabled(true);
  };

  const handleMarkSession = async () => {
    if (!newSessionDate || !selectedBooking) {
      toast.error('Please select a booking and session date');
      return;
    }
    if (!manualPrincipal.trim()) {
      toast.error('Please enter the student principal ID');
      return;
    }
    // Validate principal
    try {
      Principal.fromText(manualPrincipal.trim());
    } catch {
      toast.error('Invalid principal ID format');
      return;
    }

    try {
      await markAttendance.mutateAsync({
        // Pass as string — the hook converts to Principal internally
        student: manualPrincipal.trim(),
        bookingId: selectedBooking.paymentId,
        course: selectedBooking.service,
        sessionDate: dateToNanoseconds(newSessionDate),
        isPresent: newSessionPresent,
      });
      toast.success(`Attendance marked as ${newSessionPresent ? 'Present' : 'Absent'}`);
      setNewSessionDate('');
      setQueryEnabled(true);
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to mark attendance');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <CalendarDays className="w-5 h-5 text-gold" />
        <h2 className="text-lg font-semibold text-navy">Attendance Management</h2>
      </div>

      {/* Booking Selector */}
      <Card className="border-border-warm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-navy">Select Student Booking</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {bookingsLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Select value={selectedBookingId} onValueChange={setSelectedBookingId}>
              <SelectTrigger className="border-navy/20">
                <SelectValue placeholder="Select a completed booking..." />
              </SelectTrigger>
              <SelectContent>
                {completedBookings.length === 0 ? (
                  <SelectItem value="none" disabled>No completed bookings</SelectItem>
                ) : (
                  completedBookings.map(b => (
                    <SelectItem key={b.paymentId} value={b.paymentId}>
                      {b.name} — {b.service} ({b.date})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          )}

          {selectedBooking && (
            <div className="text-sm text-warm-text bg-warm-light/50 rounded-lg p-3 space-y-1">
              <p><span className="font-medium text-navy">Student:</span> {selectedBooking.name}</p>
              <p><span className="font-medium text-navy">Course:</span> {selectedBooking.service}</p>
              <p><span className="font-medium text-navy">Phone:</span> {selectedBooking.phone}</p>
              <p><span className="font-medium text-navy">Classes:</span> {Number(selectedBooking.numberOfClasses)}</p>
            </div>
          )}

          {/* Manual Principal Input */}
          <div className="space-y-1">
            <Label className="text-xs text-warm-text">Student Principal ID</Label>
            <Input
              value={manualPrincipal}
              onChange={e => setManualPrincipal(e.target.value)}
              placeholder="e.g. aaaaa-bbbbb-ccccc-ddddd-eee"
              className="border-navy/20 font-mono text-xs"
            />
            <p className="text-xs text-warm-text/60">
              Enter the student's Internet Identity principal ID to look up their attendance.
            </p>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-warm-text">Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="border-navy/20"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-warm-text">End Date</Label>
              <Input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="border-navy/20"
              />
            </div>
          </div>

          <Button
            onClick={handleSearch}
            disabled={!selectedBookingId || !studentPrincipal}
            className="bg-navy hover:bg-navy/90 text-cream w-full"
          >
            View Attendance Records
          </Button>
        </CardContent>
      </Card>

      {/* Mark New Session */}
      {selectedBooking && (
        <Card className="border-border-warm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-navy flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Mark Session Attendance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label className="text-xs text-warm-text">Session Date</Label>
              <Input
                type="date"
                value={newSessionDate}
                onChange={e => setNewSessionDate(e.target.value)}
                className="border-navy/20"
              />
            </div>

            <div className="flex items-center gap-3">
              <Switch
                checked={newSessionPresent}
                onCheckedChange={setNewSessionPresent}
              />
              <span className={`text-sm font-medium ${newSessionPresent ? 'text-green-600' : 'text-red-500'}`}>
                {newSessionPresent ? 'Present' : 'Absent'}
              </span>
            </div>

            <Button
              onClick={handleMarkSession}
              disabled={markAttendance.isPending || !newSessionDate || !manualPrincipal.trim()}
              className="bg-gold hover:bg-gold/90 text-navy font-semibold w-full"
            >
              {markAttendance.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-navy/30 border-t-navy rounded-full animate-spin" />
                  Saving...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4" />
                  Mark Attendance
                </span>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Attendance Summary */}
      {queryEnabled && summary && (
        <Card className="border-border-warm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-navy">Attendance Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-warm-light/50 rounded-lg p-3">
                <p className="text-2xl font-bold text-navy">{Number(summary.totalSessions)}</p>
                <p className="text-xs text-warm-text">Total Sessions</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-2xl font-bold text-green-600">{Number(summary.attendedSessions)}</p>
                <p className="text-xs text-warm-text">Present</p>
              </div>
              <div className="bg-red-50 rounded-lg p-3">
                <p className="text-2xl font-bold text-red-500">
                  {Number(summary.totalSessions) - Number(summary.attendedSessions)}
                </p>
                <p className="text-xs text-warm-text">Absent</p>
              </div>
            </div>
            {Number(summary.totalSessions) > 0 && (
              <div className="mt-3">
                <div className="flex justify-between text-xs text-warm-text mb-1">
                  <span>Attendance Rate</span>
                  <span className="font-semibold text-navy">
                    {Math.round((Number(summary.attendedSessions) / Number(summary.totalSessions)) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{ width: `${Math.round((Number(summary.attendedSessions) / Number(summary.totalSessions)) * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Attendance Records */}
      {queryEnabled && (
        <Card className="border-border-warm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-navy">Session Records</CardTitle>
          </CardHeader>
          <CardContent>
            {recordsLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : !records || records.length === 0 ? (
              <div className="text-center py-8 text-warm-text/50">
                <CalendarDays className="w-10 h-10 mx-auto mb-2 opacity-20" />
                <p>No attendance records found for this period.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {records.map((record, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-warm-light/40 border border-border-warm">
                    <div className="flex items-center gap-2">
                      {record.isPresent ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400" />
                      )}
                      <span className="text-sm text-navy font-medium">
                        {nanosecondsToDate(record.sessionDate)}
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className={record.isPresent
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-red-50 text-red-600 border-red-200'
                      }
                    >
                      {record.isPresent ? 'Present' : 'Absent'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
