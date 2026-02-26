import React, { useState } from 'react';
import { useBookingRecords, useMarkAttendance, useGetAttendanceRecords } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ClipboardList, CheckCircle, XCircle } from 'lucide-react';

export default function AttendanceManager() {
  const { data: bookings = [], isLoading: bookingsLoading } = useBookingRecords();
  const markAttendanceMutation = useMarkAttendance();

  const [selectedBookingIndex, setSelectedBookingIndex] = useState<string>('');

  const selectedBooking = selectedBookingIndex !== '' ? bookings[parseInt(selectedBookingIndex)] : null;

  const now = BigInt(Date.now()) * BigInt(1_000_000);
  const thirtyDaysAgo = now - BigInt(30) * BigInt(24) * BigInt(3600) * BigInt(1_000_000_000);

  const { data: attendanceRecords = [] } = useGetAttendanceRecords(
    selectedBooking ? (selectedBooking as any).principal ?? null : null,
    selectedBooking ? `booking-${selectedBookingIndex}` : '',
    selectedBooking ? (selectedBooking as any).service ?? '' : '',
    thirtyDaysAgo,
    now
  );

  const handleMarkAttendance = async (isPresent: boolean) => {
    if (!selectedBooking) return;
    try {
      await markAttendanceMutation.mutateAsync({
        student: (selectedBooking as any).principal,
        bookingId: `booking-${selectedBookingIndex}`,
        course: (selectedBooking as any).service ?? '',
        sessionDate: now,
        isPresent,
        markedAt: now,
      });
    } catch (err) {
      console.error('Failed to mark attendance:', err);
    }
  };

  if (bookingsLoading) {
    return <div className="text-muted-foreground">Loading bookings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-xl border border-border p-4 space-y-4">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-primary" />
          Mark Attendance
        </h3>

        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Select Student</label>
          <Select value={selectedBookingIndex} onValueChange={setSelectedBookingIndex}>
            <SelectTrigger>
              <SelectValue placeholder="Select a booking..." />
            </SelectTrigger>
            <SelectContent>
              {bookings.map((booking: any, index: number) => (
                <SelectItem key={index} value={String(index)}>
                  {booking.name} — {booking.service}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedBooking && (
          <div className="space-y-3">
            <div className="bg-muted/30 rounded-lg p-3 text-sm space-y-1">
              <p>
                <span className="text-muted-foreground">Student: </span>
                <span className="font-medium">{(selectedBooking as any).name}</span>
              </p>
              <p>
                <span className="text-muted-foreground">Course: </span>
                <span>{(selectedBooking as any).service}</span>
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => handleMarkAttendance(true)}
                disabled={markAttendanceMutation.isPending}
                className="gap-1 flex-1"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                Present
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleMarkAttendance(false)}
                disabled={markAttendanceMutation.isPending}
                className="gap-1 flex-1"
              >
                <XCircle className="w-3.5 h-3.5" />
                Absent
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Attendance Records */}
      {attendanceRecords.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-4 space-y-3">
          <h3 className="font-semibold text-foreground">Recent Attendance (30 days)</h3>
          <div className="space-y-2">
            {attendanceRecords.map((record: any, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 rounded-lg bg-muted/30"
              >
                <span className="text-sm text-foreground">
                  {new Date(Number(record.sessionDate) / 1_000_000).toLocaleDateString()}
                </span>
                <Badge variant={record.isPresent ? 'default' : 'destructive'}>
                  {record.isPresent ? 'Present' : 'Absent'}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
