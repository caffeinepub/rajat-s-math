import React, { useState } from 'react';
import { Search, User, ChevronRight, Loader2, ArrowLeft } from 'lucide-react';
import { useBookingRecords } from '../hooks/useQueries';
import { Principal } from '@dfinity/principal';
import StudentDetailView from './StudentDetailView';

const BookedStudentsSection: React.FC = () => {
  const { data: bookings, isLoading } = useBookingRecords();
  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<{
    principal: Principal;
    name: string;
    phone: string;
  } | null>(null);

  const filtered = (bookings || []).filter((b: any) =>
    b.name?.toLowerCase().includes(search.toLowerCase()) ||
    b.phone?.includes(search) ||
    b.service?.toLowerCase().includes(search.toLowerCase())
  );

  if (selectedStudent) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setSelectedStudent(null)}
          className="flex items-center gap-2 text-sm font-medium transition-colors duration-200"
          style={{ color: 'oklch(0.55 0.03 240)' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--navy)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'oklch(0.55 0.03 240)'; }}
        >
          <ArrowLeft size={16} />
          Back to Students
        </button>
        <StudentDetailView
          studentPrincipal={selectedStudent.principal}
          studentName={selectedStudent.name}
          studentPhone={selectedStudent.phone}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2
            className="text-xl font-bold"
            style={{ fontFamily: "'Playfair Display', serif", color: 'var(--navy)' }}
          >
            Booked Students
          </h2>
          <p className="text-sm mt-1" style={{ color: 'oklch(0.55 0.03 240)' }}>
            {filtered.length} student{filtered.length !== 1 ? 's' : ''} found
          </p>
        </div>
        {/* Search */}
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
            onFocus={(e) => { e.target.style.borderColor = 'var(--gold)'; e.target.style.boxShadow = '0 0 0 3px oklch(0.72 0.12 75 / 0.15)'; }}
            onBlur={(e) => { e.target.style.borderColor = 'oklch(0.88 0.015 240)'; e.target.style.boxShadow = 'none'; }}
          />
        </div>
      </div>

      {/* Table */}
      <div
        className="rounded-xl bg-white overflow-hidden"
        style={{ boxShadow: 'var(--shadow-md)', border: '1px solid oklch(0.90 0.01 240)' }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={24} className="animate-spin" style={{ color: 'var(--gold)' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <User size={40} className="mx-auto mb-3" style={{ color: 'oklch(0.75 0.02 240)' }} />
            <p className="font-medium" style={{ color: 'var(--navy)' }}>No students found</p>
            <p className="text-sm mt-1" style={{ color: 'oklch(0.60 0.03 240)' }}>
              {search ? 'Try a different search term' : 'No bookings yet'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: 'var(--cream)', borderBottom: '1px solid oklch(0.90 0.01 240)' }}>
                  {['Student', 'Phone', 'Service', 'Date', 'Time', 'Status', ''].map((h) => (
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
                  let principal: Principal;
                  try {
                    principal = booking.principal
                      ? Principal.fromText(booking.principal.toString())
                      : Principal.anonymous();
                  } catch {
                    principal = Principal.anonymous();
                  }

                  return (
                    <tr
                      key={i}
                      className="cursor-pointer transition-colors duration-150"
                      style={{ borderBottom: '1px solid oklch(0.93 0.01 240)' }}
                      onClick={() =>
                        setSelectedStudent({
                          principal,
                          name: booking.name || '',
                          phone: booking.phone || '',
                        })
                      }
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--cream)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; }}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                            style={{ background: 'oklch(0.22 0.07 255 / 0.1)', color: 'var(--navy)' }}
                          >
                            {booking.name?.[0]?.toUpperCase() || '?'}
                          </div>
                          <span className="font-medium text-sm" style={{ color: 'var(--navy)' }}>
                            {booking.name || '—'}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm" style={{ color: 'oklch(0.45 0.03 240)' }}>
                        {booking.phone || '—'}
                      </td>
                      <td className="px-5 py-4 text-sm" style={{ color: 'oklch(0.45 0.03 240)' }}>
                        {booking.service || '—'}
                      </td>
                      <td className="px-5 py-4 text-sm" style={{ color: 'oklch(0.45 0.03 240)' }}>
                        {booking.date || '—'}
                      </td>
                      <td className="px-5 py-4 text-sm" style={{ color: 'oklch(0.45 0.03 240)' }}>
                        {booking.time || '—'}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={booking.status} />
                      </td>
                      <td className="px-5 py-4">
                        <ChevronRight size={16} style={{ color: 'oklch(0.65 0.03 240)' }} />
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

const StatusBadge: React.FC<{ status: any }> = ({ status }) => {
  const getStatus = () => {
    if (!status) return { label: 'Unknown', cls: 'badge-pending' };
    const key = typeof status === 'object' ? Object.keys(status)[0] : status;
    switch (key) {
      case 'completed': return { label: 'Completed', cls: 'badge-confirmed' };
      case 'pending': return { label: 'Pending', cls: 'badge-pending' };
      case 'awaitingPayment': return { label: 'Awaiting Payment', cls: 'badge-pending' };
      default: return { label: key, cls: 'badge-pending' };
    }
  };
  const { label, cls } = getStatus();
  return <span className={cls}>{label}</span>;
};

export default BookedStudentsSection;
