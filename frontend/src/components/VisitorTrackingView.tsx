import React from 'react';
import { useBookingRecords } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye, LogIn, BookOpen, RefreshCw, Users } from 'lucide-react';
import { useActor } from '../hooks/useActor';
import { useQuery } from '@tanstack/react-query';

export default function VisitorTrackingView() {
  const { data: bookings, isLoading: bookingsLoading } = useBookingRecords();
  const { actor, isFetching } = useActor();

  const { isLoading: rawLoading, refetch: refetchRaw } = useQuery<void>({
    queryKey: ['visitorActivitiesRaw'],
    queryFn: async () => {
      // No getAllVisitorActivities endpoint available; placeholder
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
              <p className="text-xl font-bold text-navy">{bookings?.length ?? '—'}</p>
              <p className="text-xs text-warm-text">Total Bookings</p>
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
                Individual user activity can be queried via{' '}
                <code className="bg-gray-100 px-1 rounded">getVisitorActivitiesByUser(principal)</code>
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border-warm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-navy">How Tracking Works</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-warm-text space-y-2">
          <div className="flex items-start gap-2">
            <LogIn className="w-4 h-4 text-navy mt-0.5 shrink-0" />
            <p>
              <span className="font-medium text-navy">Login Events</span> — recorded automatically
              when authenticated users access the platform.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <BookOpen className="w-4 h-4 text-navy mt-0.5 shrink-0" />
            <p>
              <span className="font-medium text-navy">Course Views</span> — tracked when students
              browse course materials or sessions.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <Eye className="w-4 h-4 text-navy mt-0.5 shrink-0" />
            <p>
              <span className="font-medium text-navy">Per-User Lookup</span> — admins can query
              individual visitor activity using the student's principal ID.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
