import React from 'react';
import { CheckCircle, Calendar, BookOpen, User, ArrowLeft, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useCompletedBookings } from '../hooks/useQueries';
import type { BookingRecord } from '../backend';

interface CompletedSessionsProps {
  onBack: () => void;
}

function SessionCard({ record }: { record: BookingRecord }) {
  const confirmedAt = record.paymentConfirmedAt
    ? new Date(Number(record.paymentConfirmedAt) / 1_000_000).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : null;

  return (
    <div className="bg-white border-2 border-green-200 rounded-2xl p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-navy/10 flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-navy" />
          </div>
          <div>
            <p className="font-bold text-navy text-base">{record.name}</p>
            {confirmedAt && (
              <p className="text-xs text-muted-foreground">Confirmed on {confirmedAt}</p>
            )}
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-100 text-green-700 border border-green-300 text-xs font-bold flex-shrink-0">
          <CheckCircle className="w-3.5 h-3.5" />
          Completed ✓
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-warm-text">
          <BookOpen className="w-4 h-4 text-navy/60 flex-shrink-0" />
          <span className="font-medium text-navy/80">{record.service}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-warm-text">
          <Calendar className="w-4 h-4 text-navy/60 flex-shrink-0" />
          <span>{record.date} at {record.time}</span>
        </div>
      </div>
    </div>
  );
}

export function CompletedSessions({ onBack }: CompletedSessionsProps) {
  const { data: sessions, isLoading, error } = useCompletedBookings();

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-warm-light to-[oklch(0.98_0.01_80)]">
      {/* Header */}
      <div className="bg-navy text-white py-8 px-4 shadow-lg">
        <div className="max-w-5xl mx-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-white hover:bg-white/20 hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gold/30 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-gold" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-serif">Completed Sessions</h1>
              <p className="text-white/70 text-sm mt-1">
                Students who have successfully completed their tutoring sessions
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-40 w-full rounded-2xl" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20 space-y-4">
            <p className="text-warm-text">Failed to load completed sessions. Please try again.</p>
            <Button onClick={onBack} variant="outline" className="border-navy text-navy hover:bg-navy hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        ) : !sessions || sessions.length === 0 ? (
          <div className="text-center py-20 space-y-6">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-navy font-serif mb-2">No Completed Sessions Yet</h2>
              <p className="text-warm-text max-w-md mx-auto">
                Completed tutoring sessions will appear here once payments are verified by our team.
              </p>
            </div>
            <Button
              onClick={onBack}
              className="bg-navy hover:bg-navy/90 text-white px-8 py-3 rounded-xl font-semibold"
            >
              Book a Session
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8">
              <p className="text-warm-text">
                <span className="font-bold text-navy text-lg">{sessions.length}</span>{' '}
                session{sessions.length !== 1 ? 's' : ''} completed
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sessions.map((session, idx) => (
                <SessionCard key={idx} record={session} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Footer attribution */}
      <div className="text-center py-8 border-t border-border-warm mt-10">
        <p className="text-sm text-warm-text">
          © {new Date().getFullYear()} Rajat's Equation — Empowering Mathematical Excellence
        </p>
      </div>
    </div>
  );
}
