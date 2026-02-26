import React, { useState } from 'react';
import { useBookingRecords } from '../hooks/useQueries';
import { Principal } from '@dfinity/principal';
import StudentDetailView from './StudentDetailView';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Users, ArrowLeft, ChevronRight } from 'lucide-react';

type BookingStatusKey = 'pending' | 'awaitingPayment' | 'completed';

function getStatusKey(status: any): BookingStatusKey {
  if (!status) return 'pending';
  if (typeof status === 'string') return status as BookingStatusKey;
  if ('pending' in status) return 'pending';
  if ('awaitingPayment' in status) return 'awaitingPayment';
  if ('completed' in status) return 'completed';
  return 'pending';
}

const STATUS_BADGE: Record<BookingStatusKey, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'Pending', variant: 'secondary' },
  awaitingPayment: { label: 'Awaiting Payment', variant: 'outline' },
  completed: { label: 'Completed', variant: 'default' },
};

interface SelectedBooking {
  principal: Principal;
  name: string;
  phone: string;
}

export default function BookedStudentsSection() {
  const { data: bookings = [], isLoading } = useBookingRecords();
  const [search, setSearch] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<SelectedBooking | null>(null);

  if (selectedBooking) {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSelectedBooking(null)}
          className="gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Students
        </Button>
        <StudentDetailView
          studentPrincipal={selectedBooking.principal}
          studentName={selectedBooking.name}
          studentPhone={selectedBooking.phone}
        />
      </div>
    );
  }

  const filtered = bookings.filter((b: any) => {
    const q = search.toLowerCase();
    return (
      b.name?.toLowerCase().includes(q) ||
      b.phone?.toLowerCase().includes(q) ||
      b.service?.toLowerCase().includes(q)
    );
  });

  if (isLoading) {
    return <div className="text-muted-foreground">Loading students...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, phone, or subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground shrink-0">
          <Users className="w-4 h-4" />
          {bookings.length} students
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>{search ? 'No students match your search.' : 'No bookings yet.'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((booking: any, index: number) => {
            const statusKey = getStatusKey(booking.status);
            const badge = STATUS_BADGE[statusKey];

            // Try to get a principal from the booking; fall back to a derived one
            let principal: Principal;
            try {
              principal = booking.principal
                ? Principal.fromText(booking.principal.toString())
                : Principal.anonymous();
            } catch {
              principal = Principal.anonymous();
            }

            return (
              <div
                key={index}
                className="bg-card rounded-xl border border-border p-4 flex items-center gap-3 cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() =>
                  setSelectedBooking({
                    principal,
                    name: booking.name,
                    phone: booking.phone,
                  })
                }
              >
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-semibold text-primary">
                    {booking.name?.charAt(0)?.toUpperCase() ?? '?'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-foreground">{booking.name}</p>
                    <Badge variant={badge.variant} className="text-xs">
                      {badge.label}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {booking.phone} · {booking.service}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {booking.date} {booking.time && `at ${booking.time}`}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
