import React, { useState } from 'react';
import { BookOpen, MessageSquare, GraduationCap, QrCode, ArrowRight, Star, Users, Award, LayoutDashboard } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsAdmin } from '../hooks/useQueries';
import BookingFlowManager from './BookingFlowManager';
import StudentEnquiryForm from './StudentEnquiryForm';

interface HeroProps {
  onNavigate: (view: string) => void;
}

const MathBackground: React.FC = () => {
  const symbols = [
    { symbol: 'Σ', x: '5%', y: '15%', size: '4rem', rotation: '-15deg', delay: '0s' },
    { symbol: '√', x: '88%', y: '10%', size: '3.5rem', rotation: '10deg', delay: '1s' },
    { symbol: 'θ', x: '15%', y: '70%', size: '3rem', rotation: '-8deg', delay: '2s' },
    { symbol: '∫', x: '80%', y: '65%', size: '4rem', rotation: '5deg', delay: '0.5s' },
    { symbol: 'π', x: '45%', y: '8%', size: '2.5rem', rotation: '-20deg', delay: '1.5s' },
    { symbol: '∞', x: '92%', y: '40%', size: '3rem', rotation: '12deg', delay: '2.5s' },
    { symbol: 'Δ', x: '3%', y: '45%', size: '2.8rem', rotation: '-5deg', delay: '3s' },
    { symbol: 'α', x: '60%', y: '85%', size: '2.5rem', rotation: '18deg', delay: '0.8s' },
    { symbol: 'β', x: '25%', y: '88%', size: '2.2rem', rotation: '-12deg', delay: '1.8s' },
    { symbol: '∂', x: '70%', y: '20%', size: '2.8rem', rotation: '8deg', delay: '2.2s' },
    { symbol: 'λ', x: '50%', y: '75%', size: '2rem', rotation: '-18deg', delay: '3.5s' },
    { symbol: '±', x: '35%', y: '5%', size: '2.2rem', rotation: '15deg', delay: '1.2s' },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Background image */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'url(/assets/generated/hero-math-bg.dim_1920x900.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      {/* Gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, oklch(0.16 0.06 255 / 0.97) 0%, oklch(0.22 0.07 255 / 0.95) 50%, oklch(0.18 0.065 255 / 0.97) 100%)',
        }}
      />
      {/* Math symbols */}
      {symbols.map((item, i) => (
        <div
          key={i}
          className="absolute select-none"
          style={{
            left: item.x,
            top: item.y,
            fontSize: item.size,
            transform: `rotate(${item.rotation})`,
            color: 'oklch(0.72 0.12 75 / 0.12)',
            animationDelay: item.delay,
            animation: `float 6s ease-in-out infinite`,
            fontFamily: "'Playfair Display', serif",
          }}
        >
          {item.symbol}
        </div>
      ))}
      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(oklch(0.72 0.12 75) 1px, transparent 1px),
            linear-gradient(90deg, oklch(0.72 0.12 75) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
    </div>
  );
};

const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
  const { identity } = useInternetIdentity();
  const { data: isAdmin } = useIsAdmin();
  const [bookingOpen, setBookingOpen] = useState(false);
  const [enquiryOpen, setEnquiryOpen] = useState(false);

  const isAuthenticated = !!identity;
  const isStudent = isAuthenticated && !isAdmin;

  const stats = [
    { icon: Users, value: '500+', label: 'Students Taught' },
    { icon: Star, value: '4.9★', label: 'Average Rating' },
    { icon: Award, value: '10+', label: 'Years Experience' },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <MathBackground />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Text Content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-8"
              style={{
                background: 'oklch(0.72 0.12 75 / 0.15)',
                border: '1px solid oklch(0.72 0.12 75 / 0.3)',
                color: 'var(--gold)',
              }}
            >
              <Star size={14} fill="currentColor" />
              Premium Mathematics Education
            </div>

            {/* Main Title */}
            <h1
              className="text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight mb-6"
              style={{ fontFamily: "'Playfair Display', serif", color: 'white' }}
            >
              Master the
              <span
                className="block italic"
                style={{ color: 'var(--gold)' }}
              >
                Language of
              </span>
              Mathematics
            </h1>

            {/* Subtitle */}
            <p
              className="text-lg lg:text-xl leading-relaxed mb-10 max-w-xl mx-auto lg:mx-0"
              style={{ color: 'oklch(0.85 0.02 240)', fontFamily: "'Inter', sans-serif" }}
            >
              Expert-led mathematics tutoring with personalized attention. From foundational concepts to advanced problem-solving — unlock your mathematical potential.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start mb-12">
              <button
                onClick={() => setBookingOpen(true)}
                className="btn-gold text-base px-8 py-4 rounded-xl font-semibold"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                <BookOpen size={18} />
                Book a Session
                <ArrowRight size={16} />
              </button>

              <button
                onClick={() => setEnquiryOpen(true)}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-semibold transition-all duration-200"
                style={{
                  border: '2px solid oklch(1 0 0 / 0.3)',
                  color: 'white',
                  fontFamily: "'Inter', sans-serif",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--gold)';
                  e.currentTarget.style.color = 'var(--gold)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'oklch(1 0 0 / 0.3)';
                  e.currentTarget.style.color = 'white';
                }}
              >
                <MessageSquare size={18} />
                Send Enquiry
              </button>

              <button
                onClick={() => onNavigate('student-portal')}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-semibold transition-all duration-200"
                style={{
                  border: '2px solid oklch(1 0 0 / 0.2)',
                  color: 'oklch(0.85 0.02 240)',
                  fontFamily: "'Inter', sans-serif",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'oklch(1 0 0 / 0.08)';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'oklch(0.85 0.02 240)';
                }}
              >
                <GraduationCap size={18} />
                Student Portal
              </button>

              <button
                onClick={() => onNavigate('qr-checkin')}
                className="inline-flex items-center gap-2 px-6 py-4 rounded-xl text-sm font-semibold transition-all duration-200"
                style={{
                  border: '1px solid oklch(1 0 0 / 0.15)',
                  color: 'oklch(0.75 0.02 240)',
                  fontFamily: "'Inter', sans-serif",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'oklch(1 0 0 / 0.05)';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'oklch(0.75 0.02 240)';
                }}
              >
                <QrCode size={16} />
                QR Check-In
              </button>

              {isStudent && (
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-semibold transition-all duration-200"
                  style={{
                    background: 'oklch(1 0 0 / 0.1)',
                    border: '1px solid oklch(1 0 0 / 0.2)',
                    color: 'white',
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  <LayoutDashboard size={18} />
                  My Dashboard
                </button>
              )}
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 justify-center lg:justify-start">
              {stats.map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ background: 'oklch(0.72 0.12 75 / 0.15)' }}
                    >
                      <Icon size={18} style={{ color: 'var(--gold)' }} />
                    </div>
                    <div>
                      <div className="text-xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                        {stat.value}
                      </div>
                      <div className="text-xs" style={{ color: 'oklch(0.70 0.02 240)' }}>
                        {stat.label}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Visual Card */}
          <div className="hidden lg:flex justify-center items-center">
            <div className="relative">
              {/* Main card */}
              <div
                className="rounded-3xl p-8 w-80"
                style={{
                  background: 'oklch(1 0 0 / 0.06)',
                  border: '1px solid oklch(1 0 0 / 0.12)',
                  backdropFilter: 'blur(20px)',
                }}
              >
                {/* Logo */}
                <div className="flex justify-center mb-6">
                  <div
                    className="w-24 h-24 rounded-2xl overflow-hidden shadow-lg"
                    style={{ border: '2px solid var(--gold)' }}
                  >
                    <img
                      src="/assets/rajat's equation logo.jpg"
                      alt="Rajat's Equation"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const t = e.target as HTMLImageElement;
                        t.style.display = 'none';
                        const parent = t.parentElement;
                        if (parent) {
                          parent.style.background = 'var(--navy-light)';
                          parent.style.display = 'flex';
                          parent.style.alignItems = 'center';
                          parent.style.justifyContent = 'center';
                          parent.innerHTML = '<span style="color:var(--gold);font-family:Playfair Display,serif;font-weight:700;font-size:36px">R</span>';
                        }
                      }}
                    />
                  </div>
                </div>

                <h3
                  className="text-2xl font-bold text-center text-white mb-2"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Rajat's Equation
                </h3>
                <p className="text-center text-sm mb-6" style={{ color: 'var(--gold)' }}>
                  Where Mathematics Meets Mastery
                </p>

                {/* Feature list */}
                {[
                  'Personalized 1-on-1 Sessions',
                  'Structured Group Classes',
                  'Comprehensive Study Materials',
                  'Progress Tracking & Analytics',
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3 mb-3">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: 'var(--gold)' }}
                    >
                      <span className="text-xs font-bold" style={{ color: 'var(--navy)' }}>✓</span>
                    </div>
                    <span className="text-sm" style={{ color: 'oklch(0.85 0.02 240)' }}>{feature}</span>
                  </div>
                ))}
              </div>

              {/* Floating accent cards */}
              <div
                className="absolute -top-6 -right-6 rounded-2xl px-4 py-3 shadow-lg"
                style={{
                  background: 'var(--gold)',
                  color: 'var(--navy)',
                }}
              >
                <div className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>∑</div>
                <div className="text-xs font-semibold">Expert Tutor</div>
              </div>

              <div
                className="absolute -bottom-4 -left-6 rounded-2xl px-4 py-3 shadow-lg"
                style={{
                  background: 'white',
                  color: 'var(--navy)',
                }}
              >
                <div className="text-lg font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>4.9 ★</div>
                <div className="text-xs text-gray-500">Student Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
        <span className="text-xs" style={{ color: 'oklch(0.65 0.02 240)' }}>Scroll to explore</span>
        <div
          className="w-5 h-8 rounded-full border-2 flex items-start justify-center pt-1.5"
          style={{ borderColor: 'oklch(0.65 0.02 240)' }}
        >
          <div className="w-1 h-2 rounded-full" style={{ background: 'var(--gold)' }} />
        </div>
      </div>

      <BookingFlowManager open={bookingOpen} onClose={() => setBookingOpen(false)} />
      {enquiryOpen && (
        <StudentEnquiryForm onBack={() => setEnquiryOpen(false)} />
      )}
    </section>
  );
};

export default Hero;
