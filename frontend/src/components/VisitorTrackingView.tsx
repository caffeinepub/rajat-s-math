import React, { useState } from 'react';
import { Principal } from '@dfinity/principal';
import { useGetBookingRecords } from '../hooks/useQueries';
import { useGetVisitorActivitiesByUser } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Eye, LogIn, BookOpen, RefreshCw, Users } from 'lucide-react';
import { useActor } from '../hooks/useActor';
import { useQuery } from '@tanstack/react-query';
import type { VisitorActivity } from '../backend';
import { EventType } from '../backend';

function nanosecondsToDateTime(ns: bigint): string {
  const ms = Number(ns / BigInt(1_000_000));
  return new Date(ms).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// We fetch all visitor activities by querying known principals from booking records
function useAllVisitorActivities(principals: Principal[]) {
  const { actor, isFetching } = useActor();

  return useQuery<Map<string, VisitorActivity[]>>({
    queryKey: ['allVisitorActivities', principals.map(p => p.toString()).join(',')],
    queryFn: async () => {
      if (!actor || principals.length === 0) return new Map();
      const results = new Map<string, VisitorActivity[]>();
      await Promise.all(
        principals.map(async p => {
          try {
            const activities = await actor.getVisitorActivitiesByUser(p);
            if (activities.length > 0) {
              results.set(p.toString(), activities);
            }
          } catch {
            // skip unauthorized or missing
          }
        })
      );
      return results;
    },
    enabled: !!actor && !isFetching && principals.length > 0,
  });
}

export default function VisitorTrackingView() {
  const { data: bookings, isLoading: bookingsLoading } = useGetBookingRecords();

  // Extract unique principals from bookings (those who have logged in)
  // In practice, visitor tracking is for authenticated users who haven't purchased
  // We'll show all tracked activity grouped by principal
  const { actor, isFetching } = useActor();

  const { data: allActivities, isLoading: activitiesLoading, refetch } = useQuery<
    Array<{ principal: string; activities: VisitorActivity[] }>
  >({
    queryKey: ['visitorActivitiesAll'],
    queryFn: async () => {
      if (!actor) return [];
      // We can't enumerate all principals from the backend directly,
      // so we use a best-effort approach: query activities for principals
      // found in booking records
      if (!bookings) return [];
      const results: Array<{ principal: string; activities: VisitorActivity[] }> = [];
      // Collect unique principals from any source we have
      // Since bookings don't store principal, we'll show a message
      return results;
    },
    enabled: !!actor && !isFetching && !!bookings,
  });

  // Direct approach: use a dedicated admin query if available
  // Since backend only has getVisitorActivitiesByUser (per-user), 
  // we show a summary view with available data
  const { data: rawActivities, isLoading: rawLoading, refetch: refetchRaw } = useQuery<
    VisitorActivity[]
  >({
    queryKey: ['visitorActivitiesRaw'],
    queryFn: async () => {
      if (!actor) return [];
      // We'll try to get activities for the current user as a demo
      // In production, the admin would need a getAllVisitorActivities endpoint
      return [];
    },
    enabled: !!actor && !isFetching,
  });

  const isLoading = bookingsLoading || rawLoading;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-gold" />
          <h2 className="text-xl font-semibold text-navy">Visitor Activity Tracking</h2>
        </div>
        <Button variant="ghost" size="sm" onClick={() => refetchRaw()} className="text-warm-text">
          <RefreshCw className="w-4 h-4 mr-1" /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border-warm">
          <CardContent className="pt-4 pb-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-navy">—</p>
              <p className="text-xs text-warm-text">Tracked Visitors</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border-warm">
          <CardContent className="pt-4 pb-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <LogIn className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-navy">—</p>
              <p className="text-xs text-warm-text">Login Events</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border-warm">
          <CardContent className="pt-4 pb-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-navy">—</p>
              <p className="text-xs text-warm-text">Course Views</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border-warm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-navy">Activity Log</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : (
            <div className="text-center py-10 text-warm-text">
              <Eye className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="font-medium text-navy mb-1">Visitor Tracking Active</p>
              <p className="text-sm max-w-md mx-auto">
                Login and course-view events are being recorded for authenticated users. 
                A <code className="bg-gray-100 px-1 rounded text-xs">getAllVisitorActivities</code> admin 
                endpoint is needed to display aggregated data here.
              </p>
              <p className="text-xs mt-3 text-warm-text/70">
                Individual user activity can be queried via <code className="bg-gray-100 px-1 rounded">getVisitorActivitiesByUser(principal)</code>
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border-warm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-navy">How Tracking Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-warm-text">
          <div className="flex items-start gap-3 p-3 bg-warm-light/50 rounded-lg">
            <LogIn className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-navy">Login Events</p>
              <p>Recorded once per browser session when an authenticated user accesses the platform.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-warm-light/50 rounded-lg">
            <BookOpen className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-navy">Course View Events</p>
              <p>Recorded when an authenticated user views a course they have not yet purchased.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-warm-light/50 rounded-lg">
            <Eye className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-navy">Privacy</p>
              <p>Only authenticated (Internet Identity) users are tracked. Anonymous visitors are not recorded.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
