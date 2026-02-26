import React, { useState } from 'react';
import { Principal } from '@dfinity/principal';
import { MeetingPlatform } from '../backend';
import {
  useGetStudentSessions,
  useAddStudentSession,
  useDeleteStudentSession,
  useGetStudentMaterials,
  useAddStudentMaterial,
  useDeleteStudentMaterial,
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
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Clock,
  BookOpen,
  Link,
  FileText,
  File,
  Trash2,
  Plus,
  ChevronDown,
  ChevronUp,
  Video,
  Edit2,
  X,
  ExternalLink,
} from 'lucide-react';

interface StudentDetailViewProps {
  studentPrincipal: Principal;
  studentName: string;
  studentPhone: string;
}

const PLATFORM_LABELS: Record<string, string> = {
  googleMeet: 'Google Meet',
  zohoMeet: 'Zoho Meet',
  zoom: 'Zoom',
};

const PLATFORM_COLORS: Record<string, string> = {
  googleMeet: 'bg-blue-100 text-blue-800',
  zohoMeet: 'bg-green-100 text-green-800',
  zoom: 'bg-indigo-100 text-indigo-800',
};

function getPlatformKey(platform: any): string {
  if (!platform) return '';
  if (typeof platform === 'string') return platform;
  if (platform.__kind__) return platform.__kind__;
  return Object.keys(platform)[0] ?? '';
}

export default function StudentDetailView({
  studentPrincipal,
  studentName,
  studentPhone,
}: StudentDetailViewProps) {
  const { data: sessions = [], isLoading: sessionsLoading } = useGetStudentSessions(studentPrincipal);
  const { data: materials = [], isLoading: materialsLoading } = useGetStudentMaterials(studentPrincipal);

  const addSessionMutation = useAddStudentSession();
  const deleteSessionMutation = useDeleteStudentSession();
  const addMaterialMutation = useAddStudentMaterial();
  const deleteMaterialMutation = useDeleteStudentMaterial();
  const addOrUpdateMeetingLinkMutation = useAddOrUpdateMeetingLink();
  const removeMeetingLinkMutation = useRemoveMeetingLink();

  // Session form state
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [sessionDate, setSessionDate] = useState('');
  const [sessionTime, setSessionTime] = useState('');
  const [sessionTopic, setSessionTopic] = useState('');
  const [sessionDuration, setSessionDuration] = useState('60');
  const [sessionMeetingPlatform, setSessionMeetingPlatform] = useState<string>('');
  const [sessionMeetingLink, setSessionMeetingLink] = useState('');

  // Material form state
  const [showMaterialForm, setShowMaterialForm] = useState(false);
  const [materialType, setMaterialType] = useState<'link' | 'text' | 'file'>('link');
  const [materialTitle, setMaterialTitle] = useState('');
  const [materialContent, setMaterialContent] = useState('');

  // Meeting link edit state
  const [editingMeetingLinkIndex, setEditingMeetingLinkIndex] = useState<number | null>(null);
  const [editPlatform, setEditPlatform] = useState<string>('');
  const [editMeetingLink, setEditMeetingLink] = useState('');

  const handleAddSession = async () => {
    if (!sessionDate || !sessionTime || !sessionTopic) return;
    try {
      await addSessionMutation.mutateAsync({
        studentPrincipal,
        date: sessionDate,
        time: sessionTime,
        topic: sessionTopic,
        duration: parseInt(sessionDuration),
      });
      setSessionDate('');
      setSessionTime('');
      setSessionTopic('');
      setSessionDuration('60');
      setSessionMeetingPlatform('');
      setSessionMeetingLink('');
      setShowSessionForm(false);
    } catch (err) {
      console.error('Failed to add session:', err);
    }
  };

  const handleAddMaterial = async () => {
    if (!materialTitle || !materialContent) return;
    try {
      await addMaterialMutation.mutateAsync({
        studentPrincipal,
        materialType: { [materialType]: null } as any,
        title: materialTitle,
        content: materialContent,
        timestamp: BigInt(Date.now()) * BigInt(1_000_000),
      });
      setMaterialTitle('');
      setMaterialContent('');
      setMaterialType('link');
      setShowMaterialForm(false);
    } catch (err) {
      console.error('Failed to add material:', err);
    }
  };

  const handleDeleteSession = async (index: number) => {
    try {
      await deleteSessionMutation.mutateAsync({ studentPrincipal, index });
    } catch (err) {
      console.error('Failed to delete session:', err);
    }
  };

  const handleDeleteMaterial = async (index: number) => {
    try {
      await deleteMaterialMutation.mutateAsync({ studentPrincipal, index });
    } catch (err) {
      console.error('Failed to delete material:', err);
    }
  };

  const handleSaveMeetingLink = async (sessionTitle: string) => {
    if (!editPlatform || !editMeetingLink) return;
    try {
      const platformMap: Record<string, MeetingPlatform> = {
        googleMeet: MeetingPlatform.googleMeet,
        zohoMeet: MeetingPlatform.zohoMeet,
        zoom: MeetingPlatform.zoom,
      };
      await addOrUpdateMeetingLinkMutation.mutateAsync({
        sessionTitle,
        platform: platformMap[editPlatform],
        meetingLink: editMeetingLink,
      });
      setEditingMeetingLinkIndex(null);
      setEditPlatform('');
      setEditMeetingLink('');
    } catch (err) {
      console.error('Failed to save meeting link:', err);
    }
  };

  const handleRemoveMeetingLink = async (sessionTitle: string) => {
    try {
      await removeMeetingLinkMutation.mutateAsync(sessionTitle);
    } catch (err) {
      console.error('Failed to remove meeting link:', err);
    }
  };

  const startEditMeetingLink = (index: number, session: any) => {
    setEditingMeetingLinkIndex(index);
    const platformKey = getPlatformKey(session.meetingPlatform);
    setEditPlatform(platformKey || 'googleMeet');
    setEditMeetingLink(session.meetingLink ?? '');
  };

  const getMaterialIcon = (type: any) => {
    const key = typeof type === 'string' ? type : Object.keys(type ?? {})[0];
    if (key === 'link') return <Link className="w-4 h-4" />;
    if (key === 'text') return <FileText className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Student Info */}
      <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
        <h3 className="font-semibold text-foreground">{studentName}</h3>
        <p className="text-sm text-muted-foreground">{studentPhone}</p>
        <p className="text-xs text-muted-foreground mt-1 font-mono">
          {studentPrincipal.toString().slice(0, 20)}...
        </p>
      </div>

      {/* Sessions Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-foreground flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            Sessions ({sessions.length})
          </h4>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowSessionForm(!showSessionForm)}
            className="gap-1"
          >
            {showSessionForm ? <ChevronUp className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
            Add Session
          </Button>
        </div>

        {/* Add Session Form */}
        {showSessionForm && (
          <div className="bg-muted/30 rounded-lg p-4 mb-4 border border-border space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Date</Label>
                <Input
                  type="date"
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Time</Label>
                <Input
                  type="time"
                  value={sessionTime}
                  onChange={(e) => setSessionTime(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs">Topic</Label>
              <Input
                placeholder="Session topic"
                value={sessionTopic}
                onChange={(e) => setSessionTopic(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Duration (minutes)</Label>
              <Input
                type="number"
                value={sessionDuration}
                onChange={(e) => setSessionDuration(e.target.value)}
                className="mt-1"
              />
            </div>
            {/* Meeting Link (optional) */}
            <div className="border-t border-border pt-3">
              <Label className="text-xs font-medium text-muted-foreground">
                Meeting Link (optional)
              </Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <div>
                  <Label className="text-xs">Platform</Label>
                  <Select value={sessionMeetingPlatform} onValueChange={setSessionMeetingPlatform}>
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
                    value={sessionMeetingLink}
                    onChange={(e) => setSessionMeetingLink(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <Button
                size="sm"
                onClick={handleAddSession}
                disabled={addSessionMutation.isPending || !sessionDate || !sessionTime || !sessionTopic}
                className="flex-1"
              >
                {addSessionMutation.isPending ? 'Adding...' : 'Add Session'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowSessionForm(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Sessions List */}
        {sessionsLoading ? (
          <p className="text-sm text-muted-foreground">Loading sessions...</p>
        ) : sessions.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">No sessions added yet.</p>
        ) : (
          <div className="space-y-3">
            {sessions.map((session: any, index: number) => {
              const platformKey = getPlatformKey(session.meetingPlatform);
              const hasMeetingLink = !!session.meetingLink && !!platformKey;
              const isEditingThis = editingMeetingLinkIndex === index;

              return (
                <div
                  key={index}
                  className="bg-card rounded-lg p-3 border border-border"
                >
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

                      {/* Meeting Link Display */}
                      {hasMeetingLink && !isEditingThis && (
                        <div className="mt-2 flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${PLATFORM_COLORS[platformKey] ?? 'bg-gray-100 text-gray-700'}`}
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
                                  This will remove the meeting link from this session. The session itself will remain.
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

                      {/* No meeting link — show add button */}
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
                                value={editMeetingLink}
                                onChange={(e) => setEditMeetingLink(e.target.value)}
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
                                addOrUpdateMeetingLinkMutation.isPending ||
                                !editPlatform ||
                                !editMeetingLink
                              }
                            >
                              {addOrUpdateMeetingLinkMutation.isPending ? 'Saving...' : 'Save'}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs"
                              onClick={() => {
                                setEditingMeetingLinkIndex(null);
                                setEditPlatform('');
                                setEditMeetingLink('');
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
                        <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0 text-destructive hover:text-destructive">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Session?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete the session "{session.topic}". This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteSession(index)}
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

      {/* Materials Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-foreground flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            Materials ({materials.length})
          </h4>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowMaterialForm(!showMaterialForm)}
            className="gap-1"
          >
            {showMaterialForm ? <ChevronUp className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
            Add Material
          </Button>
        </div>

        {/* Add Material Form */}
        {showMaterialForm && (
          <div className="bg-muted/30 rounded-lg p-4 mb-4 border border-border space-y-3">
            <div>
              <Label className="text-xs">Type</Label>
              <Select value={materialType} onValueChange={(v) => setMaterialType(v as any)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="link">Link</SelectItem>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="file">File</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Title</Label>
              <Input
                placeholder="Material title"
                value={materialTitle}
                onChange={(e) => setMaterialTitle(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">
                {materialType === 'link' ? 'URL' : materialType === 'text' ? 'Content' : 'File URL'}
              </Label>
              <Input
                placeholder={materialType === 'link' ? 'https://...' : 'Enter content'}
                value={materialContent}
                onChange={(e) => setMaterialContent(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleAddMaterial}
                disabled={addMaterialMutation.isPending || !materialTitle || !materialContent}
                className="flex-1"
              >
                {addMaterialMutation.isPending ? 'Adding...' : 'Add Material'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowMaterialForm(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Materials List */}
        {materialsLoading ? (
          <p className="text-sm text-muted-foreground">Loading materials...</p>
        ) : materials.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">No materials added yet.</p>
        ) : (
          <div className="space-y-2">
            {materials.map((material: any, index: number) => {
              const typeKey =
                typeof material.materialType === 'string'
                  ? material.materialType
                  : Object.keys(material.materialType ?? {})[0];
              return (
                <div
                  key={index}
                  className="bg-card rounded-lg p-3 border border-border flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-muted-foreground">{getMaterialIcon(material.materialType)}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{material.title}</p>
                      {typeKey === 'link' || typeKey === 'file' ? (
                        <a
                          href={material.content}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary underline truncate block max-w-[200px]"
                        >
                          {material.content}
                        </a>
                      ) : (
                        <p className="text-xs text-muted-foreground truncate">{material.content}</p>
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
                        <AlertDialogTitle>Delete Material?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete "{material.title}". This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteMaterial(index)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
