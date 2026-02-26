import React, { useState } from 'react';
import { Principal } from '@dfinity/principal';
import { MeetingPlatform } from '../backend';
import {
  useGetStudentSessions,
  useAddStudentSession,
  useDeleteStudentSession,
  useAddOrUpdateMeetingLink,
  useRemoveMeetingLink,
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
import {
  Calendar,
  Clock,
  Trash2,
  Plus,
  ChevronDown,
  ChevronUp,
  Video,
  Edit2,
  X,
  ExternalLink,
} from 'lucide-react';

interface StudentScheduleTabProps {
  studentPrincipal: Principal;
  courseName?: string;
}

const PLATFORM_LABELS: Record<string, string> = {
  googleMeet: 'Google Meet',
  zohoMeet: 'Zoho Meet',
  zoom: 'Zoom',
};

const PLATFORM_COLORS: Record<string, string> = {
  googleMeet: 'bg-blue-100 text-blue-800 border-blue-200',
  zohoMeet: 'bg-green-100 text-green-800 border-green-200',
  zoom: 'bg-indigo-100 text-indigo-800 border-indigo-200',
};

function getPlatformKey(platform: any): string {
  if (!platform) return '';
  if (typeof platform === 'string') return platform;
  if (platform.__kind__) return platform.__kind__;
  return Object.keys(platform)[0] ?? '';
}

export default function StudentScheduleTab({
  studentPrincipal,
  courseName,
}: StudentScheduleTabProps) {
  const { data: sessions = [], isLoading } = useGetStudentSessions(studentPrincipal);
  const addSessionMutation = useAddStudentSession();
  const deleteSessionMutation = useDeleteStudentSession();
  const addOrUpdateMeetingLinkMutation = useAddOrUpdateMeetingLink();
  const removeMeetingLinkMutation = useRemoveMeetingLink();

  const [showForm, setShowForm] = useState(false);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState('60');
  const [meetingPlatform, setMeetingPlatform] = useState('');
  const [meetingLink, setMeetingLink] = useState('');

  // Inline meeting link edit state
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editPlatform, setEditPlatform] = useState('');
  const [editLink, setEditLink] = useState('');

  const handleAdd = async () => {
    if (!date || !time || !topic) return;
    try {
      await addSessionMutation.mutateAsync({
        studentPrincipal,
        date,
        time,
        topic,
        duration: parseInt(duration),
      });
      setDate('');
      setTime('');
      setTopic('');
      setDuration('60');
      setMeetingPlatform('');
      setMeetingLink('');
      setShowForm(false);
    } catch (err) {
      console.error('Failed to add session:', err);
    }
  };

  const handleDelete = async (index: number) => {
    try {
      await deleteSessionMutation.mutateAsync({ studentPrincipal, index });
    } catch (err) {
      console.error('Failed to delete session:', err);
    }
  };

  const startEditMeetingLink = (index: number, session: any) => {
    setEditingIndex(index);
    const platformKey = getPlatformKey(session.meetingPlatform);
    setEditPlatform(platformKey || 'googleMeet');
    setEditLink(session.meetingLink ?? '');
  };

  const handleSaveMeetingLink = async (sessionTopic: string) => {
    if (!editPlatform || !editLink) return;
    const platformMap: Record<string, MeetingPlatform> = {
      googleMeet: MeetingPlatform.googleMeet,
      zohoMeet: MeetingPlatform.zohoMeet,
      zoom: MeetingPlatform.zoom,
    };
    try {
      await addOrUpdateMeetingLinkMutation.mutateAsync({
        sessionTitle: sessionTopic,
        platform: platformMap[editPlatform],
        meetingLink: editLink,
      });
      setEditingIndex(null);
      setEditPlatform('');
      setEditLink('');
    } catch (err) {
      console.error('Failed to save meeting link:', err);
    }
  };

  const handleRemoveMeetingLink = async (sessionTopic: string) => {
    try {
      await removeMeetingLinkMutation.mutateAsync(sessionTopic);
    } catch (err) {
      console.error('Failed to remove meeting link:', err);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          Schedule {courseName ? `— ${courseName}` : ''}
        </h3>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowForm(!showForm)}
          className="gap-1"
        >
          {showForm ? <ChevronUp className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
          Add Session
        </Button>
      </div>

      {/* Add Session Form */}
      {showForm && (
        <div className="bg-muted/30 rounded-lg p-4 border border-border space-y-3">
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
            <Label className="text-xs">Topic</Label>
            <Input
              placeholder="Session topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-xs">Duration (minutes)</Label>
            <Input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="mt-1"
            />
          </div>

          {/* Optional meeting link */}
          <div className="border-t border-border pt-3">
            <Label className="text-xs font-medium text-muted-foreground">
              Meeting Link (optional)
            </Label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div>
                <Label className="text-xs">Platform</Label>
                <Select value={meetingPlatform} onValueChange={setMeetingPlatform}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="googleMeet">Google Meet</SelectItem>
                    <SelectItem value="zohoMeet">Zoho Meet</SelectItem>
                    <SelectItem value="zoom">Zoom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Meeting URL</Label>
                <Input
                  placeholder="https://..."
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <Button
              size="sm"
              onClick={handleAdd}
              disabled={addSessionMutation.isPending || !date || !time || !topic}
              className="flex-1"
            >
              {addSessionMutation.isPending ? 'Adding...' : 'Add Session'}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Sessions List */}
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading sessions...</p>
      ) : sessions.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">No sessions added yet.</p>
      ) : (
        <div className="space-y-3">
          {sessions.map((session: any, index: number) => {
            const platformKey = getPlatformKey(session.meetingPlatform);
            const hasMeetingLink = !!session.meetingLink && !!platformKey;
            const isEditingThis = editingIndex === index;

            return (
              <div key={index} className="bg-card rounded-lg p-3 border border-border">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground">{session.topic}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {session.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {session.time}
                      </span>
                      <span>{session.duration} min</span>
                    </div>

                    {/* Meeting link display */}
                    {hasMeetingLink && !isEditingThis && (
                      <div className="mt-2 flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium border ${PLATFORM_COLORS[platformKey] ?? 'bg-gray-100 text-gray-700 border-gray-200'}`}
                        >
                          {PLATFORM_LABELS[platformKey] ?? platformKey}
                        </span>
                        <a
                          href={session.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary underline truncate max-w-[160px]"
                        >
                          {session.meetingLink}
                        </a>
                        <button
                          onClick={() => startEditMeetingLink(index, session)}
                          className="text-muted-foreground hover:text-foreground"
                          title="Edit meeting link"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <button
                              className="text-destructive hover:text-destructive/80"
                              title="Remove meeting link"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove Meeting Link?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will remove the meeting link from this session.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleRemoveMeetingLink(session.topic)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}

                    {/* No meeting link — add button */}
                    {!hasMeetingLink && !isEditingThis && (
                      <button
                        onClick={() => startEditMeetingLink(index, session)}
                        className="mt-2 text-xs text-primary hover:underline flex items-center gap-1"
                      >
                        <Video className="w-3 h-3" /> Add meeting link
                      </button>
                    )}

                    {/* Inline edit form */}
                    {isEditingThis && (
                      <div className="mt-2 bg-muted/40 rounded p-3 space-y-2 border border-border">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs">Platform</Label>
                            <Select value={editPlatform} onValueChange={setEditPlatform}>
                              <SelectTrigger className="mt-1 h-8 text-xs">
                                <SelectValue placeholder="Platform" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="googleMeet">Google Meet</SelectItem>
                                <SelectItem value="zohoMeet">Zoho Meet</SelectItem>
                                <SelectItem value="zoom">Zoom</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs">Meeting URL</Label>
                            <Input
                              placeholder="https://..."
                              value={editLink}
                              onChange={(e) => setEditLink(e.target.value)}
                              className="mt-1 h-8 text-xs"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => handleSaveMeetingLink(session.topic)}
                            disabled={
                              addOrUpdateMeetingLinkMutation.isPending || !editPlatform || !editLink
                            }
                          >
                            {addOrUpdateMeetingLinkMutation.isPending ? 'Saving...' : 'Save'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={() => {
                              setEditingIndex(null);
                              setEditPlatform('');
                              setEditLink('');
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 shrink-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Session?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete "{session.topic}". This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(index)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
