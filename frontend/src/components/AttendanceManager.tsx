import React, { useState } from 'react';
import { Principal } from '@dfinity/principal';
import { useGetBookingRecords } from '../hooks/useQueries';
import { useGetAttendanceRecords, useGetAttendanceSummary, useMarkAttendance } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarDays, CheckCircle, XCircle, Plus, BookOpen } from 'lucide-react';
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
  const [manualPrincipal, setManualPrincipal] = useState<string>('');

  const selectedBooking = bookings?.find(b => b.paymentId === selectedBookingId);

  // Parse principal from manual input
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
      toast.error('Please select a session date');
      return;
    }
    if (!studentPrincipal) {
      toast.error('Please enter a valid student principal ID to mark attendance');
      return;
    }

    try {
      await markAttendance.mutateAsync({
        student: studentPrincipal,
        bookingId: selectedBooking.paymentId,
        course: selectedBooking.service,
        sessionDate: dateToNanoseconds(newSessionDate),
        isPresent: newSessionPresent,
      });
      toast.success('Attendance marked successfully');
      setNewSessionDate('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to mark attendance';
      toast.error(msg);
    }
  };

  const handleToggleAttendance = async (
    student: Principal,
    bookingId: string,
    course: string,
    sessionDate: bigint,
    currentPresent: boolean
  ) => {
    try {
      await markAttendance.mutateAsync({
        student,
        bookingId,
        course,
        sessionDate,
        isPresent: !currentPresent,
      });
      toast.success('Attendance updated');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update attendance';
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <CalendarDays className="w-5 h-5 text-gold" />
        <h2 className="text-xl font-semibold text-navy">Attendance Management</h2>
      </div>

      {/* Filters */}
      <Card className="border-border-warm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-navy">Search Attendance Records</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-warm-text text-sm">Student Booking</Label>
              {bookingsLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select value={selectedBookingId} onValueChange={setSelectedBookingId}>
                  <SelectTrigger className="border-border-warm">
                    <SelectValue placeholder="Select a student..." />
                  </SelectTrigger>
                  <SelectContent>
                    {completedBookings.map(b => (
                      <SelectItem key={b.paymentId} value={b.paymentId}>
                        {b.name} — {b.service}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="space-y-1">
              <Label className="text-warm-text text-sm">Student Principal ID</Label>
              <Input
                placeholder="Enter student's principal ID..."
                value={manualPrincipal}
                onChange={e => setManualPrincipal(e.target.value)}
                className="border-border-warm font-mono text-xs"
              />
              {manualPrincipal && !studentPrincipal && (
                <p className="text-xs text-red-500">Invalid principal ID format</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-warm-text text-sm">Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="border-border-warm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-warm-text text-sm">End Date</Label>
              <Input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="border-border-warm"
              />
            </div>
          </div>
          <Button onClick={handleSearch} className="bg-navy text-cream hover:bg-navy/90">
            <BookOpen className="w-4 h-4 mr-2" />
            Load Records
          </Button>
        </CardContent>
      </Card>

      {/* Summary */}
      {summary && (
        <div className="grid grid-cols-3 gap-4">
          <Card className="border-border-warm text-center">
            <CardContent className="pt-4 pb-3">
              <p className="text-2xl font-bold text-navy">{summary.totalSessions.toString()}</p>
              <p className="text-xs text-warm-text mt-1">Total Sessions</p>
            </CardContent>
          </Card>
          <Card className="border-border-warm text-center">
            <CardContent className="pt-4 pb-3">
              <p className="text-2xl font-bold text-green-600">{summary.attendedSessions.toString()}</p>
              <p className="text-xs text-warm-text mt-1">Attended</p>
            </CardContent>
          </Card>
          <Card className="border-border-warm text-center">
            <CardContent className="pt-4 pb-3">
              <p className="text-2xl font-bold text-gold">
                {summary.totalSessions > 0
                  ? Math.round((Number(summary.attendedSessions) / Number(summary.totalSessions)) * 100)
                  : 0}%
              </p>
              <p className="text-xs text-warm-text mt-1">Attendance Rate</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add New Session */}
      {selectedBooking && (
        <Card className="border-border-warm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-navy flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Mark New Session for {selectedBooking.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 items-end">
              <div className="space-y-1">
                <Label className="text-warm-text text-sm">Session Date</Label>
                <Input
                  type="date"
                  value={newSessionDate}
                  onChange={e => setNewSessionDate(e.target.value)}
                  className="border-border-warm w-48"
                />
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-warm-text text-sm">Present</Label>
                <Switch
                  checked={newSessionPresent}
                  onCheckedChange={setNewSessionPresent}
                />
              </div>
              <Button
                onClick={handleMarkSession}
                disabled={markAttendance.isPending || !studentPrincipal}
                className="bg-gold text-navy hover:bg-gold/90"
              >
                {markAttendance.isPending ? 'Saving...' : 'Mark Attendance'}
              </Button>
            </div>
            {!studentPrincipal && (
              <p className="text-xs text-amber-600 mt-2">
                Enter the student's principal ID above to mark attendance.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Records List */}
      {queryEnabled && records && records.length > 0 && (
        <Card className="border-border-warm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-navy">Attendance Records</CardTitle>
          </CardHeader>
          <CardContent>
            {recordsLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : (
              <div className="space-y-2">
                {[...records]
                  .sort((a, b) => Number(b.sessionDate - a.sessionDate))
                  .map((record, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-lg border border-border-warm"
                    >
                      <div className="flex items-center gap-3">
                        {record.isPresent ? (
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                        )}
                        <span className="text-sm text-navy font-medium">
                          {nanosecondsToDate(record.sessionDate)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          className={
                            record.isPresent
                              ? 'bg-green-100 text-green-700 border-green-200'
                              : 'bg-red-100 text-red-700 border-red-200'
                          }
                          variant="outline"
                        >
                          {record.isPresent ? 'Present' : 'Absent'}
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            studentPrincipal &&
                            handleToggleAttendance(
                              studentPrincipal,
                              record.bookingId,
                              record.course,
                              record.sessionDate,
                              record.isPresent
                            )
                          }
                          disabled={markAttendance.isPending || !studentPrincipal}
                          className="text-xs h-7 text-navy hover:bg-navy/5"
                        >
                          Toggle
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {queryEnabled && (!records || records.length === 0) && !recordsLoading && (
        <Card className="border-border-warm">
          <CardContent className="py-8 text-center text-warm-text">
            <CalendarDays className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p>No attendance records found for the selected filters.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
