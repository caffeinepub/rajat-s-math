import React from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetAttendanceRecords, useGetAttendanceSummary } from '../hooks/useQueries';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ClipboardList } from 'lucide-react';

interface StudentAttendanceViewProps {
  studentPrincipal?: any;
  bookingId?: string;
  course?: string;
}

export default function StudentAttendanceView({
  studentPrincipal,
  bookingId = '',
  course = '',
}: StudentAttendanceViewProps) {
  const { identity } = useInternetIdentity();
  const principal = studentPrincipal ?? identity?.getPrincipal() ?? null;

  const now = BigInt(Date.now()) * BigInt(1_000_000);
  const ninetyDaysAgo = now - BigInt(90) * BigInt(24) * BigInt(3600) * BigInt(1_000_000_000);

  const { data: records = [], isLoading: recordsLoading } = useGetAttendanceRecords(
    principal,
    bookingId,
    course,
    ninetyDaysAgo,
    now
  );

  const { data: summary, isLoading: summaryLoading } = useGetAttendanceSummary(
    principal,
    bookingId,
    course,
    ninetyDaysAgo,
    now
  );

  if (recordsLoading || summaryLoading) {
    return <div className="text-muted-foreground text-sm">Loading attendance...</div>;
  }

  const attended = summary?.attendedSessions ?? 0;
  const total = summary?.totalSessions ?? 0;
  const percentage = total > 0 ? Math.round((Number(attended) / Number(total)) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Summary */}
      {total > 0 && (
        <div className="bg-card rounded-xl border border-border p-4 space-y-3">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-primary" />
            Attendance Summary
          </h3>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">{String(total)}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{String(attended)}</p>
              <p className="text-xs text-muted-foreground">Present</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{percentage}%</p>
              <p className="text-xs text-muted-foreground">Rate</p>
            </div>
          </div>
          <Progress value={percentage} className="h-2" />
        </div>
      )}

      {/* Records */}
      {records.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <ClipboardList className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">No attendance records found.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {records.map((record: any, index: number) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-card rounded-lg border border-border"
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
      )}
    </div>
  );
}
