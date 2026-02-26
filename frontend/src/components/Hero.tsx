import React, { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { BookingFlowManager } from './BookingFlowManager';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import PaymentEnquiryForm from './PaymentEnquiryForm';
import {
  GraduationCap,
  BookOpen,
  QrCode,
  ClipboardList,
  Users,
  BarChart2,
} from 'lucide-react';

type View =
  | 'home'
  | 'admin'
  | 'student-portal'
  | 'student-dashboard'
  | 'completed-sessions'
  | 'enquiry-portal'
  | 'enquiry-form'
  | 'qr-checkin';

interface HeroProps {
  onNavigate: (view: View) => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

export function Hero({ onNavigate, isAuthenticated, isAdmin }: HeroProps) {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [paymentEnquiryOpen, setPaymentEnquiryOpen] = useState(false);

  return (
    <section className="relative bg-navy text-cream overflow-hidden">
      {/* Math-themed background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />
      </div>
      {/* Floating math symbols */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
        <span className="absolute top-8 left-[8%] text-gold/10 text-6xl font-serif">∑</span>
        <span className="absolute top-16 right-[12%] text-gold/10 text-5xl font-serif">√</span>
        <span className="absolute bottom-12 left-[15%] text-gold/10 text-4xl font-serif">∫</span>
        <span className="absolute bottom-8 right-[8%] text-gold/10 text-5xl font-serif">π</span>
        <span className="absolute top-1/2 left-[3%] text-gold/10 text-3xl font-serif">Δ</span>
        <span className="absolute top-1/3 right-[5%] text-gold/10 text-4xl font-serif">θ</span>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-20 sm:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            {/* Brand Logo */}
            <div className="flex items-center gap-4 mb-8">
              <img
                src="/assets/generated/rajats-equation-logo.dim_250x200.png"
                alt="Rajat's Equation Logo"
                className="h-20 w-auto object-contain"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
            </div>

            <h1 className="text-4xl sm:text-5xl font-serif font-bold leading-tight mb-4">
              Master Mathematical
              <span className="text-gold block">Thinking</span>
            </h1>

            <p className="text-cream/80 text-lg mb-8 leading-relaxed">
              Expert mathematics tutoring for JEE, Boards, and Olympiads. Build strong foundations
              with personalized guidance from The Rajat's Equation.
            </p>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setBookingOpen(true)}
                className="px-6 py-3 bg-gold text-navy font-bold rounded-lg hover:bg-gold/90 transition-colors flex items-center gap-2 shadow-lg"
              >
                <BookOpen className="w-4 h-4" />
                Book a Session
              </button>

              <button
                onClick={() => onNavigate('enquiry-form')}
                className="px-6 py-3 bg-white/10 text-cream font-semibold rounded-lg hover:bg-white/20 transition-colors border border-white/20 flex items-center gap-2"
              >
                <ClipboardList className="w-4 h-4" />
                Submit Enquiry
              </button>

              <button
                onClick={() => onNavigate('enquiry-portal')}
                className="px-6 py-3 bg-white/10 text-cream font-semibold rounded-lg hover:bg-white/20 transition-colors border border-white/20 flex items-center gap-2"
              >
                <GraduationCap className="w-4 h-4" />
                Enquiry Status
              </button>

              <button
                onClick={() => onNavigate('qr-checkin')}
                className="px-6 py-3 bg-white/10 text-cream font-semibold rounded-lg hover:bg-white/20 transition-colors border border-white/20 flex items-center gap-2"
              >
                <QrCode className="w-4 h-4" />
                QR Check-In
              </button>

              <button
                onClick={() => onNavigate('student-portal')}
                className="px-6 py-3 bg-white/10 text-cream font-semibold rounded-lg hover:bg-white/20 transition-colors border border-white/20 flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                Student Portal
              </button>

              {/* My Dashboard — only for authenticated non-admin users */}
              {isAuthenticated && !isAdmin && (
                <button
                  onClick={() => onNavigate('student-dashboard')}
                  className="px-6 py-3 bg-gold/20 text-gold font-semibold rounded-lg hover:bg-gold/30 transition-colors border border-gold/30 flex items-center gap-2"
                >
                  <BarChart2 className="w-4 h-4" />
                  My Dashboard
                </button>
              )}
            </div>
          </div>

          <div className="hidden lg:flex flex-col items-center justify-center gap-6">
            <img
              src="/assets/generated/rajats-equation-logo.dim_250x200.png"
              alt="The Rajat's Equation"
              className="w-64 h-auto object-contain drop-shadow-2xl"
              style={{ filter: 'brightness(0) invert(1)' }}
            />
            <img
              src="/assets/generated/hero-banner.dim_1200x600.png"
              alt="Mathematics Learning"
              className="w-full rounded-2xl shadow-2xl object-cover"
              style={{ maxHeight: '280px' }}
            />
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <BookingFlowManager open={bookingOpen} onClose={() => setBookingOpen(false)} />

      {/* Payment Enquiry Dialog */}
      <Dialog open={paymentEnquiryOpen} onOpenChange={setPaymentEnquiryOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-navy">Payment Enquiry</DialogTitle>
          </DialogHeader>
          <PaymentEnquiryForm onClose={() => setPaymentEnquiryOpen(false)} />
        </DialogContent>
      </Dialog>
    </section>
  );
}
