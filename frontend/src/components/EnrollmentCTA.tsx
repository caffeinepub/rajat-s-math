import React, { useState } from 'react';
import { CheckCircle, BookOpen, MessageCircle, Youtube, ArrowRight, Zap, Shield, Clock } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import BookingFlowManager from './BookingFlowManager';
import { LoginModal } from './LoginModal';

const EnrollmentCTA: React.FC = () => {
  const { identity } = useInternetIdentity();
  const [bookingOpen, setBookingOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const isAuthenticated = !!identity;

  const benefits = [
    {
      icon: Zap,
      title: 'Personalized Learning',
      description: 'Customized study plans tailored to your learning pace and goals.',
    },
    {
      icon: Shield,
      title: 'Expert Guidance',
      description: '10+ years of teaching experience with proven results.',
    },
    {
      icon: Clock,
      title: 'Flexible Scheduling',
      description: 'Book sessions at times that work best for your schedule.',
    },
    {
      icon: CheckCircle,
      title: 'Guaranteed Progress',
      description: 'Track your improvement with detailed progress analytics.',
    },
  ];

  const handleBooking = () => {
    if (!isAuthenticated) {
      setLoginModalOpen(true);
    } else {
      setBookingOpen(true);
    }
  };

  return (
    <section className="py-24 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Benefits */}
          <div>
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-6"
              style={{
                background: 'oklch(0.72 0.12 75 / 0.12)',
                border: '1px solid oklch(0.72 0.12 75 / 0.25)',
                color: 'oklch(0.55 0.14 75)',
              }}
            >
              <CheckCircle size={14} />
              Why Choose Us
            </div>

            <h2
              className="text-4xl lg:text-5xl font-bold mb-6"
              style={{ fontFamily: "'Playfair Display', serif", color: 'var(--navy)' }}
            >
              Start Your Journey to
              <span className="block italic" style={{ color: 'var(--gold)' }}>
                Mathematical Excellence
              </span>
            </h2>

            <p className="text-lg leading-relaxed mb-10" style={{ color: 'oklch(0.45 0.03 240)' }}>
              Join hundreds of students who have transformed their mathematical abilities through our structured, personalized approach to learning.
            </p>

            <div className="grid sm:grid-cols-2 gap-6">
              {benefits.map((benefit, i) => {
                const Icon = benefit.icon;
                return (
                  <div
                    key={i}
                    className="flex gap-4 p-5 rounded-xl transition-all duration-200 hover:-translate-y-0.5"
                    style={{
                      background: 'var(--cream)',
                      border: '1px solid oklch(0.90 0.015 240)',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: 'oklch(0.22 0.07 255 / 0.08)' }}
                    >
                      <Icon size={18} style={{ color: 'var(--navy)' }} />
                    </div>
                    <div>
                      <h4
                        className="font-semibold mb-1 text-sm"
                        style={{ fontFamily: "'Playfair Display', serif", color: 'var(--navy)' }}
                      >
                        {benefit.title}
                      </h4>
                      <p className="text-xs leading-relaxed" style={{ color: 'oklch(0.50 0.03 240)' }}>
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: CTA Card */}
          <div>
            <div
              className="rounded-3xl overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, var(--navy-dark) 0%, var(--navy) 100%)',
                boxShadow: 'var(--shadow-lg)',
              }}
            >
              {/* Card header */}
              <div className="p-8 pb-6 border-b" style={{ borderColor: 'oklch(1 0 0 / 0.1)' }}>
                <h3
                  className="text-3xl font-bold text-white mb-2"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Ready to Begin?
                </h3>
                <p style={{ color: 'oklch(0.75 0.02 240)' }}>
                  Take the first step towards mastering mathematics today.
                </p>
              </div>

              {/* Card body */}
              <div className="p-8 space-y-4">
                {/* What's included */}
                <div className="space-y-3 mb-8">
                  {[
                    'Free initial consultation',
                    'Customized learning plan',
                    'Access to study materials',
                    'Progress tracking dashboard',
                    'WhatsApp support between sessions',
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: 'var(--gold)' }}
                      >
                        <span className="text-xs font-bold" style={{ color: 'var(--navy)' }}>✓</span>
                      </div>
                      <span className="text-sm" style={{ color: 'oklch(0.85 0.02 240)' }}>{item}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Buttons */}
                <button
                  onClick={handleBooking}
                  className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-semibold text-base transition-all duration-200"
                  style={{
                    background: 'var(--gold)',
                    color: 'var(--navy)',
                    fontFamily: "'Inter', sans-serif",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--gold-dark)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'var(--gold)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <BookOpen size={18} />
                  Book Your First Session
                  <ArrowRight size={16} />
                </button>

                <a
                  href="https://wa.me/919424135055"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-semibold text-base transition-all duration-200"
                  style={{
                    border: '2px solid oklch(1 0 0 / 0.2)',
                    color: 'white',
                    fontFamily: "'Inter', sans-serif",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--gold)';
                    e.currentTarget.style.color = 'var(--gold)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'oklch(1 0 0 / 0.2)';
                    e.currentTarget.style.color = 'white';
                  }}
                >
                  <MessageCircle size={18} />
                  Chat on WhatsApp
                </a>

                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-medium text-sm transition-all duration-200"
                  style={{
                    color: 'oklch(0.65 0.02 240)',
                    fontFamily: "'Inter', sans-serif",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'oklch(0.65 0.02 240)';
                  }}
                >
                  <Youtube size={16} />
                  Watch Free Lessons on YouTube
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <BookingFlowManager open={bookingOpen} onClose={() => setBookingOpen(false)} />
      <LoginModal open={loginModalOpen} onClose={() => setLoginModalOpen(false)} />
    </section>
  );
};

export default EnrollmentCTA;
