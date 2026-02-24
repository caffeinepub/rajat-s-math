import React, { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsCallerAdmin } from '../hooks/useQueries';
import { LoginButton } from './LoginButton';
import { BookingFlowManager } from './BookingFlowManager';
import { GraduationCap } from 'lucide-react';

interface HeroProps {
  onNavigate?: (path: string) => void;
}

export function Hero({ onNavigate }: HeroProps) {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: isAdmin } = useIsCallerAdmin();
  const [showBooking, setShowBooking] = useState(false);

  return (
    <section className="relative bg-navy text-cream overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: "url('/assets/generated/math-hero.dim_1200x600.png')" }}
      />
      <div className="relative max-w-6xl mx-auto px-4 py-20 md:py-28">
        <div className="max-w-3xl">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-6">
            <img
              src="/assets/rajat's eqn logo -1-1.jpeg"
              alt="Rajat's Equation Logo"
              className="w-14 h-14 rounded-full object-cover border-2 border-gold"
            />
            <div>
              <p className="text-gold text-sm font-medium tracking-widest uppercase">
                Rajat's Equation
              </p>
              <p className="text-cream/60 text-xs">Mathematics Excellence</p>
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif leading-tight mb-4">
            Master the Language
            <br />
            <span className="text-gold">of Mathematics</span>
          </h1>
          <p className="text-cream/80 text-lg md:text-xl mb-8 leading-relaxed max-w-2xl">
            Personalized mathematics tutoring for students of all levels. Build confidence,
            sharpen problem-solving skills, and unlock your mathematical potential.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            {isAuthenticated ? (
              <button
                onClick={() => setShowBooking(true)}
                className="px-6 py-3 bg-gold text-navy font-semibold rounded-lg hover:bg-gold/90 transition-colors"
              >
                Book &amp; Pay Now
              </button>
            ) : (
              <LoginButton />
            )}

            <button
              onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-6 py-3 border border-cream/30 text-cream font-medium rounded-lg hover:bg-cream/10 transition-colors"
            >
              Explore Courses
            </button>

            {/* Student Portal Button */}
            <button
              onClick={() => onNavigate?.('/portal')}
              className="px-6 py-3 border border-gold/50 text-gold font-medium rounded-lg hover:bg-gold/10 transition-colors flex items-center gap-2"
            >
              <GraduationCap className="w-4 h-4" />
              Student Portal
            </button>

            {isAdmin && (
              <button
                onClick={() => onNavigate?.('/admin')}
                className="px-6 py-3 bg-cream/10 border border-cream/20 text-cream font-medium rounded-lg hover:bg-cream/20 transition-colors"
              >
                Admin Dashboard
              </button>
            )}
          </div>
        </div>
      </div>

      {showBooking && (
        <BookingFlowManager open={showBooking} onClose={() => setShowBooking(false)} />
      )}
    </section>
  );
}
