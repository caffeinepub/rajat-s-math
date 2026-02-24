import React, { useState } from 'react';
import { useGetClassSessions, useAddClassSession, useRemoveClassSession } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Clock, Video, CalendarPlus, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface StudentScheduleTabProps {
  /** The service/course name for this student's booking */
  courseName: string;
}

export default function StudentScheduleTab({ courseName }: StudentScheduleTabProps) {
  const [showForm, setShowForm] = useState(false);
  const [sessionTitle, setSessionTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [googleMeetLink, setGoogleMeetLink] = useState('');
  const [googleCalendarLink, setGoogleCalendarLink] = useState('');

  const { data: sessions, isLoading } = useGetClassSessions(courseName);
  const addSession = useAddClassSession();
  const removeSession = useRemoveClassSession();

  const sortedSessions = sessions
    ? [...sessions].sort((a, b) => {
        const dateA = new Date(`${a.date} ${a.time}`).getTime();
        const dateB = new Date(`${b.date} ${b.time}`).getTime();
        return dateA - dateB;
      })
    : [];

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

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionTitle.trim() || !date || !time) {
      toast.error('Please fill in session title, date, and time');
      return;
    }
    try {
      await addSession.mutateAsync({
        courseName,
        sessionTitle: sessionTitle.trim(),
        date,
        time,
        googleMeetLink: googleMeetLink.trim(),
        googleCalendarLink: googleCalendarLink.trim(),
        createdAt: BigInt(Date.now()) * BigInt(1_000_000),
      });
      toast.success('Session added');
      setSessionTitle('');
      setDate('');
      setTime('');
      setGoogleMeetLink('');
      setGoogleCalendarLink('');
      setShowForm(false);
    } catch {
      toast.error('Failed to add session');
    }
  };

  const handleRemove = async (title: string) => {
    try {
      await removeSession.mutateAsync({ sessionTitle: title, courseName });
      toast.success('Session removed');
    } catch {
      toast.error('Failed to remove session');
    }
  };

  return (
    <div className="space-y-3 pt-2">
      {/* Sessions List */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : sortedSessions.length === 0 ? (
        <div className="text-center py-6 text-warm-text/40">
          <Calendar className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-xs">No sessions scheduled yet for this student.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sortedSessions.map((session) => {
            const sessionDate = new Date(`${session.date}T${session.time}`);
            const isPast = sessionDate < new Date();
            return (
              <div
                key={session.sessionTitle}
                className={`p-3 rounded-lg border transition-colors ${
                  isPast
                    ? 'border-navy/5 bg-warm-light/20 opacity-60'
                    : 'border-navy/10 bg-warm-light/30 hover:bg-warm-light/60'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-navy text-xs mb-1">
                      {session.sessionTitle}
                      {isPast && (
                        <span className="ml-1.5 text-warm-text/40 font-normal">(Past)</span>
                      )}
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs text-warm-text/60 mb-1.5">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-gold" />
                        {formatDate(session.date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-gold" />
                        {session.time}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {session.googleMeetLink && (
                        <a
                          href={session.googleMeetLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors"
                        >
                          <Video className="w-3 h-3" />
                          Meet
                        </a>
                      )}
                      {session.googleCalendarLink && (
                        <a
                          href={session.googleCalendarLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-green-600 hover:bg-green-700 text-white text-xs font-medium transition-colors"
                        >
                          <CalendarPlus className="w-3 h-3" />
                          Calendar
                        </a>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50 flex-shrink-0"
                    onClick={() => handleRemove(session.sessionTitle)}
                    disabled={removeSession.isPending}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Form Toggle */}
      {!showForm ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowForm(true)}
          className="w-full border-dashed border-navy/30 text-navy/70 hover:border-gold hover:text-gold text-xs"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          Add Session
        </Button>
      ) : (
        <form onSubmit={handleAdd} className="space-y-3 p-3 rounded-lg border border-gold/30 bg-gold/5">
          <div className="space-y-1">
            <Label className="text-navy text-xs font-medium">Session Title *</Label>
            <Input
              value={sessionTitle}
              onChange={(e) => setSessionTitle(e.target.value)}
              placeholder="e.g. Introduction to Calculus"
              className="border-navy/20 focus:ring-gold h-8 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-navy text-xs font-medium">Date *</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="border-navy/20 focus:ring-gold h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-navy text-xs font-medium">Time *</Label>
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="border-navy/20 focus:ring-gold h-8 text-sm"
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-navy text-xs font-medium">Google Meet Link</Label>
            <Input
              value={googleMeetLink}
              onChange={(e) => setGoogleMeetLink(e.target.value)}
              placeholder="https://meet.google.com/..."
              className="border-navy/20 focus:ring-gold h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-navy text-xs font-medium">Google Calendar Link</Label>
            <Input
              value={googleCalendarLink}
              onChange={(e) => setGoogleCalendarLink(e.target.value)}
              placeholder="https://calendar.google.com/..."
              className="border-navy/20 focus:ring-gold h-8 text-sm"
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="submit"
              size="sm"
              disabled={addSession.isPending}
              className="bg-navy hover:bg-navy/90 text-cream text-xs h-8"
            >
              {addSession.isPending ? (
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
                  Adding...
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </span>
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowForm(false);
                setSessionTitle('');
                setDate('');
                setTime('');
                setGoogleMeetLink('');
                setGoogleCalendarLink('');
              }}
              className="text-xs h-8 text-warm-text/60"
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
