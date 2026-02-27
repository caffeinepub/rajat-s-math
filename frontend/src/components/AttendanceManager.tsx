import React, { useState } from 'react';
import { Calendar, CheckCircle, XCircle, Loader2, Search } from 'lucide-react';
import { useBookingRecords, useGetAttendanceRecords, useMarkAttendance } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Principal } from '@dfinity/principal';

const AttendanceManager: React.FC = () => {
  const { data: bookings, isLoading: bookingsLoading } = useBookingRecords();
  const markAttendance = useMarkAttendance();
  const [search, setSearch] = useState('');
  const [marking, setMarking] = useState<string | null>(null);

  const filtered = (bookings || []).filter((b: any) =>
    b.name?.toLowerCase().includes(search.toLowerCase()) ||
    b.phone?.includes(search)
  );

  const handleMark = async (booking: any, isPresent: boolean) => {
    const key = `${booking.phone}-${booking.date}`;
    setMarking(key);
    try {
      await markAttendance.mutateAsync({
        bookingId: booking.paymentId || booking.phone,
        course: booking.service,
        isPresent,
      });
    } finally {
      setMarking(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2
            className="text-xl font-bold"
            style={{ fontFamily: "'Playfair Display', serif", color: 'var(--navy)' }}
          >
            Attendance Manager
          </h2>
          <p className="text-sm mt-1" style={{ color: 'oklch(0.55 0.03 240)' }}>
            Mark and track student attendance
          </p>
        </div>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'oklch(0.60 0.03 240)' }} />
          <input
            type="text"
            placeholder="Search students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2.5 rounded-lg text-sm w-64"
            style={{
              border: '1px solid oklch(0.88 0.015 240)',
              background: 'white',
              color: 'var(--navy)',
              outline: 'none',
            }}
            onFocus={(e) => { e.target.style.borderColor = 'var(--gold)'; }}
            onBlur={(e) => { e.target.style.borderColor = 'oklch(0.88 0.015 240)'; }}
          />
        </div>
      </div>

      <div
        className="rounded-xl bg-white overflow-hidden"
        style={{ boxShadow: 'var(--shadow-md)', border: '1px solid oklch(0.90 0.01 240)' }}
      >
        {bookingsLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={24} className="animate-spin" style={{ color: 'var(--gold)' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Calendar size={40} className="mx-auto mb-3" style={{ color: 'oklch(0.75 0.02 240)' }} />
            <p className="font-medium" style={{ color: 'var(--navy)' }}>No students found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: 'var(--cream)', borderBottom: '1px solid oklch(0.90 0.01 240)' }}>
                  {['Student', 'Service', 'Date', 'Actions'].map((h) => (
                    <th
                      key={h}
                      className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider"
                      style={{ color: 'oklch(0.50 0.03 240)' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((booking: any, i: number) => {
                  const key = `${booking.phone}-${booking.date}`;
                  const isMarkingThis = marking === key;
                  return (
                    <tr
                      key={i}
                      style={{ borderBottom: '1px solid oklch(0.93 0.01 240)' }}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                            style={{ background: 'oklch(0.22 0.07 255 / 0.1)', color: 'var(--navy)' }}
                          >
                            {booking.name?.[0]?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <span className="font-medium text-sm block" style={{ color: 'var(--navy)' }}>
                              {booking.name}
                            </span>
                            <span className="text-xs" style={{ color: 'oklch(0.55 0.03 240)' }}>
                              {booking.date}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm" style={{ color: 'oklch(0.45 0.03 240)' }}>
                        {booking.service}
                      </td>
                      <td className="px-5 py-4 text-sm" style={{ color: 'oklch(0.45 0.03 240)' }}>
                        {booking.date}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleMark(booking, true)}
                            disabled={isMarkingThis}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
                            style={{
                              background: 'oklch(0.55 0.15 145 / 0.1)',
                              color: 'oklch(0.40 0.15 145)',
                              border: '1px solid oklch(0.55 0.15 145 / 0.3)',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = 'oklch(0.55 0.15 145 / 0.2)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'oklch(0.55 0.15 145 / 0.1)'; }}
                          >
                            {isMarkingThis ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                            Present
                          </button>
                          <button
                            onClick={() => handleMark(booking, false)}
                            disabled={isMarkingThis}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
                            style={{
                              background: 'oklch(0.55 0.22 25 / 0.1)',
                              color: 'oklch(0.45 0.20 25)',
                              border: '1px solid oklch(0.55 0.22 25 / 0.3)',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = 'oklch(0.55 0.22 25 / 0.2)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'oklch(0.55 0.22 25 / 0.1)'; }}
                          >
                            <XCircle size={12} />
                            Absent
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceManager;
