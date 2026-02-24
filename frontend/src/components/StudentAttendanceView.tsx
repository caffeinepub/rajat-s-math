import React, { useState } from 'react';
import { Principal } from '@dfinity/principal';
import { useGetAttendanceRecords, useGetAttendanceSummary } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { CalendarDays, CheckCircle, XCircle, TrendingUp } from 'lucide-react';

interface StudentAttendanceViewProps {
  studentPrincipal: Principal;
  courseName: string;
}

function dateToNanoseconds(dateStr: string, endOfDay = false): bigint {
  const date = new Date(dateStr + (endOfDay ? 'T23:59:59' : 'T00:00:00'));
  return BigInt(date.getTime()) * BigInt(1_000_000);
}

function nanosecondsToDate(ns: bigint): string {
  const ms = Number(ns / BigInt(1_000_000));
  return new Date(ms).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function StudentAttendanceView({ studentPrincipal, courseName }: StudentAttendanceViewProps) {
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const [startDate, setStartDate] = useState(thirtyDaysAgo.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);
  const [queryEnabled, setQueryEnabled] = useState(true);

  const startNs = dateToNanoseconds(startDate);
  const endNs = dateToNanoseconds(endDate, true);

  const { data: records, isLoading: recordsLoading } = useGetAttendanceRecords(
    studentPrincipal,
    courseName,
    startNs,
    endNs,
    queryEnabled
  );

  const { data: summary, isLoading: summaryLoading } = useGetAttendanceSummary(
    studentPrincipal,
    courseName,
    startNs,
    endNs,
    queryEnabled
  );

  const attendanceRate = summary && summary.totalSessions > 0
    ? Math.round((Number(summary.attendedSessions) / Number(summary.totalSessions)) * 100)
    : 0;

  const handleFilter = () => {
    setQueryEnabled(false);
    setTimeout(() => setQueryEnabled(true), 50);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <CalendarDays className="w-5 h-5 text-gold" />
        <h3 className="text-lg font-semibold text-navy">My Attendance</h3>
      </div>

      {/* Date Range Filter */}
      <Card className="border-border-warm">
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-1">
              <Label className="text-warm-text text-sm">From</Label>
              <Input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="border-border-warm w-44"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-warm-text text-sm">To</Label>
              <Input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="border-border-warm w-44"
              />
            </div>
            <Button onClick={handleFilter} variant="outline" className="border-navy text-navy hover:bg-navy/5">
              Apply Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {summaryLoading ? (
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}
        </div>
      ) : summary ? (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Card className="border-border-warm text-center">
              <CardContent className="pt-4 pb-3">
                <p className="text-2xl font-bold text-navy">{summary.totalSessions.toString()}</p>
                <p className="text-xs text-warm-text mt-1">Total Classes</p>
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
                <p className="text-2xl font-bold text-gold">{attendanceRate}%</p>
                <p className="text-xs text-warm-text mt-1">Rate</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border-warm">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-warm-text flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" /> Attendance Progress
                </span>
                <span className="text-sm font-semibold text-navy">{attendanceRate}%</span>
              </div>
              <Progress value={attendanceRate} className="h-2" />
              <p className="text-xs text-warm-text mt-2">
                {attendanceRate >= 75
                  ? '✅ Good attendance! Keep it up.'
                  : attendanceRate >= 50
                  ? '⚠️ Attendance below recommended 75%. Try to attend more classes.'
                  : '❌ Low attendance. Please contact your instructor.'}
              </p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="border-border-warm">
          <CardContent className="py-8 text-center text-warm-text">
            <CalendarDays className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p>No attendance records found for the selected period.</p>
          </CardContent>
        </Card>
      )}

      {/* Records List */}
      <Card className="border-border-warm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-navy">Session Details</CardTitle>
        </CardHeader>
        <CardContent>
          {recordsLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : !records || records.length === 0 ? (
            <p className="text-center text-warm-text py-4 text-sm">No sessions recorded in this period.</p>
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
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
