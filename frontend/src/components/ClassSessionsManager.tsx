import React, { useState } from 'react';
import { ClassSession } from '../backend';
import {
  useGetClassSessions,
  useAddClassSession,
  useRemoveClassSession,
} from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Clock, Video, CalendarPlus, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';

const COURSE_NAMES = [
  'One-on-One Mathematics Tutoring',
  'Group Mathematics Classes',
  'Intensive Problem Solving Workshop',
  'Foundation Mathematics Course',
  'Advanced Mathematics Program',
];

export default function ClassSessionsManager() {
  const [selectedCourse, setSelectedCourse] = useState(COURSE_NAMES[0]);
  const [sessionTitle, setSessionTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [googleMeetLink, setGoogleMeetLink] = useState('');
  const [googleCalendarLink, setGoogleCalendarLink] = useState('');

  const { data: sessions, isLoading } = useGetClassSessions(selectedCourse);
  const addSession = useAddClassSession();
  const removeSession = useRemoveClassSession();

  const sortedSessions = sessions
    ? [...sessions].sort((a, b) => {
        const dateA = new Date(`${a.date} ${a.time}`).getTime();
        const dateB = new Date(`${b.date} ${b.time}`).getTime();
        return dateA - dateB;
      })
    : [];

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionTitle.trim() || !date || !time || !googleMeetLink.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    try {
      await addSession.mutateAsync({
        courseName: selectedCourse,
        sessionTitle: sessionTitle.trim(),
        date,
        time,
        googleMeetLink: googleMeetLink.trim(),
        googleCalendarLink: googleCalendarLink.trim(),
        createdAt: BigInt(Date.now()) * BigInt(1_000_000),
      });
      toast.success('Session added successfully');
      setSessionTitle('');
      setDate('');
      setTime('');
      setGoogleMeetLink('');
      setGoogleCalendarLink('');
    } catch (err) {
      toast.error('Failed to add session');
    }
  };

  const handleRemove = async (title: string) => {
    try {
      await removeSession.mutateAsync({ sessionTitle: title, courseName: selectedCourse });
      toast.success('Session removed');
    } catch (err) {
      toast.error('Failed to remove session');
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Course Selector */}
      <div className="space-y-2">
        <Label className="text-navy font-semibold">Select Course</Label>
        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
          <SelectTrigger className="border-navy/20 focus:ring-gold">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {COURSE_NAMES.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Sessions List */}
      <Card className="border-navy/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-navy text-base font-semibold">
            Class Schedule
            {sessions && (
              <span className="ml-2 text-sm font-normal text-warm-text/60">
                ({sessions.length} sessions)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : sortedSessions.length === 0 ? (
            <div className="text-center py-8 text-warm-text/50">
              <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No sessions scheduled for this course.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedSessions.map((session) => (
                <div
                  key={session.sessionTitle}
                  className="p-4 rounded-lg border border-navy/10 bg-warm-light/30 hover:bg-warm-light/60 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-navy text-sm mb-2">{session.sessionTitle}</p>
                      <div className="flex flex-wrap gap-3 text-xs text-warm-text/70">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-gold" />
                          {formatDate(session.date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-gold" />
                          {session.time}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {session.googleMeetLink && (
                          <a
                            href={session.googleMeetLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 underline"
                          >
                            <Video className="w-3 h-3" />
                            Meet Link
                          </a>
                        )}
                        {session.googleCalendarLink && (
                          <a
                            href={session.googleCalendarLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-green-600 hover:text-green-800 underline"
                          >
                            <CalendarPlus className="w-3 h-3" />
                            Calendar Link
                          </a>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                      onClick={() => handleRemove(session.sessionTitle)}
                      disabled={removeSession.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Session Form */}
      <Card className="border-gold/30 bg-gold/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-navy text-base font-semibold flex items-center gap-2">
            <Plus className="w-4 h-4 text-gold" />
            Add New Session
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-navy text-sm">Session Title *</Label>
              <Input
                value={sessionTitle}
                onChange={(e) => setSessionTitle(e.target.value)}
                placeholder="e.g. Introduction to Calculus"
                className="border-navy/20 focus:ring-gold"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-navy text-sm">Date *</Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="border-navy/20 focus:ring-gold"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-navy text-sm">Time *</Label>
                <Input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="border-navy/20 focus:ring-gold"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-navy text-sm">Google Meet Link *</Label>
              <Input
                value={googleMeetLink}
                onChange={(e) => setGoogleMeetLink(e.target.value)}
                placeholder="https://meet.google.com/..."
                className="border-navy/20 focus:ring-gold"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-navy text-sm">Google Calendar Link (optional)</Label>
              <Input
                value={googleCalendarLink}
                onChange={(e) => setGoogleCalendarLink(e.target.value)}
                placeholder="https://calendar.google.com/..."
                className="border-navy/20 focus:ring-gold"
              />
            </div>
            <Button
              type="submit"
              disabled={addSession.isPending}
              className="bg-navy hover:bg-navy/90 text-cream"
            >
              {addSession.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
                  Adding...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Session
                </span>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
