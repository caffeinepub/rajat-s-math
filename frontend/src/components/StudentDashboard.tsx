import React from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetStudentSessions, useGetStudentMaterials } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calendar,
  Clock,
  BookOpen,
  Link,
  FileText,
  File,
  LogIn,
  Video,
  ExternalLink,
} from 'lucide-react';

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

export default function StudentDashboard() {
  const { identity, login, loginStatus } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const principal = identity?.getPrincipal();

  const { data: sessions = [], isLoading: sessionsLoading } = useGetStudentSessions(
    isAuthenticated ? principal : null
  );
  const { data: materials = [], isLoading: materialsLoading } = useGetStudentMaterials(
    isAuthenticated ? principal : null
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-4">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <LogIn className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Student Dashboard</h2>
          <p className="text-muted-foreground max-w-sm">
            Please log in to view your assigned sessions and learning materials.
          </p>
        </div>
        <Button
          onClick={login}
          disabled={loginStatus === 'logging-in'}
          className="px-8"
        >
          {loginStatus === 'logging-in' ? 'Logging in...' : 'Login to Continue'}
        </Button>
      </div>
    );
  }

  const getMaterialIcon = (type: any) => {
    const key = typeof type === 'string' ? type : Object.keys(type ?? {})[0];
    if (key === 'link') return <Link className="w-4 h-4" />;
    if (key === 'text') return <FileText className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="text-center space-y-1">
        <h1 className="text-3xl font-bold text-foreground">My Dashboard</h1>
        <p className="text-muted-foreground text-sm">
          Your personalized learning hub
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="text-3xl font-bold text-primary">{sessions.length}</p>
          <p className="text-sm text-muted-foreground mt-1">Sessions Assigned</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="text-3xl font-bold text-primary">{materials.length}</p>
          <p className="text-sm text-muted-foreground mt-1">Materials Available</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="sessions">
        <TabsList className="w-full">
          <TabsTrigger value="sessions" className="flex-1">
            <Calendar className="w-4 h-4 mr-2" />
            Sessions
          </TabsTrigger>
          <TabsTrigger value="materials" className="flex-1">
            <BookOpen className="w-4 h-4 mr-2" />
            Materials
          </TabsTrigger>
        </TabsList>

        {/* Sessions Tab */}
        <TabsContent value="sessions" className="mt-4 space-y-3">
          {sessionsLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading sessions...</div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <Calendar className="w-10 h-10 text-muted-foreground/40 mx-auto" />
              <p className="text-muted-foreground">No sessions assigned yet.</p>
              <p className="text-sm text-muted-foreground/70">
                Your tutor will add sessions here once scheduled.
              </p>
            </div>
          ) : (
            sessions.map((session: any, index: number) => {
              const platformKey = getPlatformKey(session.meetingPlatform);
              const hasMeetingLink = !!session.meetingLink && !!platformKey;

              return (
                <div
                  key={index}
                  className="bg-card rounded-xl border border-border p-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{session.topic}</h3>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {session.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {session.time}
                        </span>
                        <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                          {session.duration} min
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Join Class Button */}
                  {hasMeetingLink && (
                    <div className="flex items-center gap-3 pt-1 border-t border-border">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium border ${PLATFORM_COLORS[platformKey] ?? 'bg-gray-100 text-gray-700 border-gray-200'}`}
                      >
                        {PLATFORM_LABELS[platformKey] ?? platformKey}
                      </span>
                      <a
                        href={session.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors px-4 py-1.5 rounded-lg text-sm font-semibold shadow-sm"
                      >
                        <Video className="w-4 h-4" />
                        Join Class
                        <ExternalLink className="w-3 h-3 opacity-70" />
                      </a>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </TabsContent>

        {/* Materials Tab */}
        <TabsContent value="materials" className="mt-4 space-y-3">
          {materialsLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading materials...</div>
          ) : materials.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <BookOpen className="w-10 h-10 text-muted-foreground/40 mx-auto" />
              <p className="text-muted-foreground">No materials available yet.</p>
              <p className="text-sm text-muted-foreground/70">
                Your tutor will add learning materials here.
              </p>
            </div>
          ) : (
            materials.map((material: any, index: number) => {
              const typeKey =
                typeof material.materialType === 'string'
                  ? material.materialType
                  : Object.keys(material.materialType ?? {})[0];
              return (
                <div
                  key={index}
                  className="bg-card rounded-xl border border-border p-4 flex items-center gap-3"
                >
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    {getMaterialIcon(material.materialType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{material.title}</p>
                    {typeKey === 'link' || typeKey === 'file' ? (
                      <a
                        href={material.content}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary underline truncate block"
                      >
                        Open resource
                      </a>
                    ) : (
                      <p className="text-sm text-muted-foreground truncate">{material.content}</p>
                    )}
                  </div>
                  <Badge variant="outline" className="text-xs shrink-0 capitalize">
                    {typeKey}
                  </Badge>
                </div>
              );
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
