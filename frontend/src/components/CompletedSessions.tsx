import React from 'react';
import { useGetCompletedBookings } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle, Calendar, User, Phone, BookOpen } from 'lucide-react';

export default function CompletedSessions() {
  const { data: completedBookings, isLoading, error } = useGetCompletedBookings();

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
        <Skeleton className="h-10 w-64" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Unable to load completed sessions. Please try again later.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground font-serif flex items-center gap-3">
          <CheckCircle className="w-8 h-8 text-green-600" />
          Completed Sessions
        </h1>
        <p className="text-muted-foreground mt-2">
          All successfully completed tutoring sessions.
        </p>
      </div>

      {!completedBookings || completedBookings.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">No completed sessions yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {completedBookings.map((booking, idx) => (
            <Card key={idx} className="border-green-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    {booking.name}
                  </CardTitle>
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    Completed
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-3.5 h-3.5" />
                    {booking.phone}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <BookOpen className="w-3.5 h-3.5" />
                    {booking.service}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5" />
                    {booking.date} at {booking.time}
                  </div>
                  <div className="text-muted-foreground">
                    {Number(booking.numberOfClasses)} classes · ₹{Number(booking.finalAmount)}
                  </div>
                </div>
                {booking.accessCode && (
                  <div className="mt-2 pt-2 border-t">
                    <span className="text-xs text-muted-foreground">Access Code: </span>
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{booking.accessCode}</code>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
