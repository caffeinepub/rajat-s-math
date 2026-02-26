import React, { useState } from 'react';
import {
  useGetCourseSessions,
  useAddCourseSession,
  useDeleteCourseSession,
} from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Calendar, Trash2, Plus, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

const COURSES = [
  'JEE Mathematics',
  'NEET Mathematics',
  'Board Exam Prep',
  'Foundation Course',
  'Advanced Problem Solving',
  'Crash Course',
];

export default function ClassSessionsManager() {
  const [selectedCourse, setSelectedCourse] = useState(COURSES[0]);
  const { data: sessions = [], isLoading } = useGetCourseSessions(selectedCourse);
  const addMutation = useAddCourseSession();
  const deleteMutation = useDeleteCourseSession();

  const [showForm, setShowForm] = useState(false);
  const [sessionTitle, setSessionTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [meetLink, setMeetLink] = useState('');
  const [calendarLink, setCalendarLink] = useState('');

  const handleAdd = async () => {
    if (!sessionTitle || !date || !time) return;
    try {
      await addMutation.mutateAsync({
        courseName: selectedCourse,
        sessionTitle,
        date,
        time,
        googleMeetLink: meetLink,
        googleCalendarLink: calendarLink,
        createdAt: BigInt(Date.now()) * BigInt(1_000_000),
        meetingPlatform: null,
        meetingLink: null,
      });
      setSessionTitle('');
      setDate('');
      setTime('');
      setMeetLink('');
      setCalendarLink('');
      setShowForm(false);
    } catch (err) {
      console.error('Failed to add session:', err);
    }
  };

  const handleDelete = async (title: string) => {
    try {
      await deleteMutation.mutateAsync(title);
    } catch (err) {
      console.error('Failed to delete session:', err);
    }
  };

  const sorted = [...sessions].sort((a: any, b: any) => {
    const da = new Date(`${a.date} ${a.time}`).getTime();
    const db = new Date(`${b.date} ${b.time}`).getTime();
    return db - da;
  });

  return (
    <div className="space-y-4">
      {/* Course selector */}
      <div>
        <Label className="text-sm">Course</Label>
        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {COURSES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Add button */}
      <div className="flex justify-end">
        <Button size="sm" variant="outline" onClick={() => setShowForm(!showForm)} className="gap-1">
          {showForm ? <ChevronUp className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
          Add Session
        </Button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-muted/30 rounded-lg p-4 border border-border space-y-3">
          <div>
            <Label className="text-xs">Session Title</Label>
            <Input
              placeholder="e.g. Calculus - Limits"
              value={sessionTitle}
              onChange={(e) => setSessionTitle(e.target.value)}
              className="mt-1"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Time</Label>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="mt-1" />
            </div>
          </div>
          <div>
            <Label className="text-xs">Google Meet Link (optional)</Label>
            <Input
              placeholder="https://meet.google.com/..."
              value={meetLink}
              onChange={(e) => setMeetLink(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-xs">Google Calendar Link (optional)</Label>
            <Input
              placeholder="https://calendar.google.com/..."
              value={calendarLink}
              onChange={(e) => setCalendarLink(e.target.value)}
              className="mt-1"
            />
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleAdd}
              disabled={addMutation.isPending || !sessionTitle || !date || !time}
              className="flex-1"
            >
              {addMutation.isPending ? 'Adding...' : 'Add Session'}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Sessions list */}
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading sessions...</p>
      ) : sorted.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">No sessions for this course.</p>
      ) : (
        <div className="space-y-2">
          {sorted.map((session: any, index: number) => (
            <div key={index} className="bg-card rounded-lg p-3 border border-border flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-foreground">{session.sessionTitle}</p>
                <p className="text-xs text-muted-foreground">
                  {session.date} at {session.time}
                </p>
                <div className="flex gap-2 mt-1 flex-wrap">
                  {session.googleMeetLink && (
                    <a
                      href={session.googleMeetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary underline flex items-center gap-0.5"
                    >
                      Meet <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                  {session.googleCalendarLink && (
                    <a
                      href={session.googleCalendarLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary underline flex items-center gap-0.5"
                    >
                      Calendar <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0 text-destructive hover:text-destructive">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Session?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete "{session.sessionTitle}".
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete(session.sessionTitle)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
