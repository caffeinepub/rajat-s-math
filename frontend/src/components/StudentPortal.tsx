import React, { useState } from 'react';
import { Principal } from '@dfinity/principal';
import { BookingRecord } from '../backend';
import { useFindBookingByAccessCode } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  GraduationCap,
  Key,
  BookOpen,
  Calendar,
  MessageSquare,
  CalendarDays,
  ArrowLeft,
} from 'lucide-react';
import { toast } from 'sonner';
import StudentMaterialsTab from './StudentMaterialsTab';
import StudentScheduleTab from './StudentScheduleTab';
import StudentSupportView from './StudentSupportView';
import StudentAttendanceView from './StudentAttendanceView';

interface StudentPortalProps {
  onNavigate?: (path: string) => void;
}

export default function StudentPortal({ onNavigate }: StudentPortalProps) {
  const { identity } = useInternetIdentity();
  const [accessCode, setAccessCode] = useState('');
  const [booking, setBooking] = useState<BookingRecord | null>(null);
  const findBooking = useFindBookingByAccessCode();

  const studentPrincipal: Principal | null = identity?.getPrincipal() ?? null;

  const handleAccessCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessCode.trim()) {
      toast.error('Please enter your access code');
      return;
    }
    try {
      const result = await findBooking.mutateAsync(accessCode.trim());
      if (result) {
        setBooking(result);
        toast.success('Access granted! Welcome to your portal.');
      } else {
        toast.error('Invalid access code. Please check and try again.');
      }
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to verify access code');
    }
  };

  if (!booking) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-border-warm shadow-lg">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 bg-navy/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <GraduationCap className="w-8 h-8 text-navy" />
            </div>
            <CardTitle className="text-navy font-serif text-xl">Student Portal</CardTitle>
            <p className="text-warm-text text-sm mt-1">
              Enter your access code to view your course materials
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAccessCodeSubmit} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="accessCode" className="text-warm-text text-sm">
                  Access Code
                </Label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-text/50" />
                  <Input
                    id="accessCode"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    placeholder="Enter your access code..."
                    className="pl-9 border-border-warm"
                  />
                </div>
              </div>
              <Button
                type="submit"
                disabled={findBooking.isPending}
                className="w-full bg-navy text-cream hover:bg-navy/90"
              >
                {findBooking.isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
                    Verifying...
                  </span>
                ) : (
                  'Access Portal'
                )}
              </Button>
            </form>
            {onNavigate && (
              <Button
                variant="ghost"
                className="w-full mt-2 text-warm-text"
                onClick={() => onNavigate('/')}
              >
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Home
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-navy font-serif">
              Welcome, {booking.name}!
            </h1>
            <p className="text-warm-text text-sm mt-1">{booking.service}</p>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <Badge
              variant="outline"
              className="bg-green-50 text-green-700 border-green-200"
            >
              {booking.classType === 'oneOnOne' ? '1-on-1' : 'Group'} ·{' '}
              {booking.numberOfClasses.toString()} classes
            </Badge>
            <Badge variant="outline" className="bg-navy/5 text-navy border-navy/20">
              ₹{booking.finalAmount.toString()}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setBooking(null)}
              className="text-warm-text text-xs"
            >
              <ArrowLeft className="w-3 h-3 mr-1" /> Change Code
            </Button>
          </div>
        </div>

        <Tabs defaultValue="materials">
          <TabsList className="flex flex-wrap h-auto gap-1 mb-6 bg-warm-light/50 p-1 rounded-lg">
            <TabsTrigger
              value="materials"
              className="text-xs sm:text-sm flex items-center gap-1"
            >
              <BookOpen className="w-3 h-3" /> Materials
            </TabsTrigger>
            <TabsTrigger
              value="schedule"
              className="text-xs sm:text-sm flex items-center gap-1"
            >
              <Calendar className="w-3 h-3" /> Schedule
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
          </TabsList>

          <TabsContent value="materials">
            <StudentMaterialsTab courseName={booking.service} />
          </TabsContent>

          <TabsContent value="schedule">
            <StudentScheduleTab courseName={booking.service} />
          </TabsContent>

          <TabsContent value="support">
            {studentPrincipal ? (
              <StudentSupportView studentPrincipal={studentPrincipal} />
            ) : (
              <Card className="border-border-warm">
                <CardContent className="py-8 text-center text-warm-text">
                  <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p>Please log in to access support messages.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="attendance">
            {studentPrincipal ? (
              <StudentAttendanceView
                studentPrincipal={studentPrincipal}
                courseName={booking.service}
              />
            ) : (
              <Card className="border-border-warm">
                <CardContent className="py-8 text-center text-warm-text">
                  <CalendarDays className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p>Please log in to view your attendance records.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
