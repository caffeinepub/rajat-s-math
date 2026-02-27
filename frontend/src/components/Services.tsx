import React, { useState } from 'react';
import { BookOpen, Users, Clock, Star, ArrowRight, MessageCircle, CreditCard, CheckCircle, Award, Trophy } from 'lucide-react';
import BookingFlowManager from './BookingFlowManager';
import PaymentEnquiryForm from './PaymentEnquiryForm';
import StudentEnquiryForm from './StudentEnquiryForm';

interface Service {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  price: string;
  priceNote: string;
  features: string[];
  icon: React.ElementType;
  highlight?: boolean;
  badge?: string;
}

const services: Service[] = [
  {
    id: 'jee-mains',
    title: 'JEE Mains',
    subtitle: 'Engineering Entrance',
    description: 'Comprehensive preparation for JEE Mains with focused problem-solving techniques and exam strategies.',
    price: '₹800',
    priceNote: 'per session',
    features: ['Full syllabus coverage', 'Mock tests & analysis', 'Doubt clearing sessions', 'Study materials included'],
    icon: Star,
    badge: 'Popular',
    highlight: true,
  },
  {
    id: 'jee-advanced',
    title: 'JEE Advanced',
    subtitle: 'IIT Preparation',
    description: 'Advanced-level coaching for IIT aspirants with deep conceptual understanding and complex problem solving.',
    price: '₹1000',
    priceNote: 'per session',
    features: ['Advanced problem sets', 'IIT-level concepts', 'Previous year papers', 'Personalized feedback'],
    icon: Award,
    badge: 'Premium',
  },
  {
    id: 'boards',
    title: 'Board Exams',
    subtitle: 'Class 10 & 12',
    description: 'Targeted preparation for CBSE/ICSE board examinations with chapter-wise practice and revision.',
    price: '₹600',
    priceNote: 'per session',
    features: ['Chapter-wise practice', 'NCERT solutions', 'Sample papers', 'Exam tips & tricks'],
    icon: BookOpen,
  },
  {
    id: 'foundation',
    title: 'Foundation Course',
    subtitle: 'Class 8-10',
    description: 'Build strong mathematical foundations for future competitive exams with conceptual clarity.',
    price: '₹500',
    priceNote: 'per session',
    features: ['Concept building', 'Regular assessments', 'Interactive learning', 'Progress reports'],
    icon: Users,
  },
  {
    id: 'olympiad',
    title: 'Math Olympiad',
    subtitle: 'Competition Prep',
    description: 'Specialized training for national and international mathematics olympiads and competitions.',
    price: '₹1200',
    priceNote: 'per session',
    features: ['Olympiad strategies', 'Creative problem solving', 'Competition practice', 'Expert guidance'],
    icon: Trophy,
  },
  {
    id: 'crash-course',
    title: 'Crash Course',
    subtitle: 'Intensive Revision',
    description: 'Intensive short-term revision program for students appearing in upcoming examinations.',
    price: '₹700',
    priceNote: 'per session',
    features: ['Quick revision', 'High-yield topics', 'Formula sheets', 'Last-minute tips'],
    icon: Clock,
  },
];

const Services: React.FC = () => {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [paymentEnquiryOpen, setPaymentEnquiryOpen] = useState(false);
  const [studentEnquiryOpen, setStudentEnquiryOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string>('');

  const handleBookSession = (serviceId: string) => {
    setSelectedService(serviceId);
    setBookingOpen(true);
  };

  return (
    <section id="courses" className="py-24 px-4" style={{ background: 'var(--cream)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-6"
            style={{
              background: 'oklch(0.72 0.12 75 / 0.12)',
              border: '1px solid oklch(0.72 0.12 75 / 0.25)',
              color: 'oklch(0.55 0.14 75)',
            }}
          >
            <BookOpen size={14} />
            Our Courses &amp; Pricing
          </div>
          <h2
            className="text-4xl lg:text-5xl font-bold mb-4"
            style={{ fontFamily: "'Playfair Display', serif", color: 'var(--navy)' }}
          >
            Choose Your Learning Path
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'oklch(0.45 0.03 240)' }}>
            Tailored mathematics programs designed to help you achieve your academic goals with expert guidance.
          </p>
        </div>

        {/* Service Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <div
                key={service.id}
                className="relative rounded-2xl bg-white overflow-hidden transition-all duration-300 hover:-translate-y-1"
                style={{
                  boxShadow: service.highlight ? 'var(--shadow-gold)' : 'var(--shadow-md)',
                  border: service.highlight ? '2px solid var(--gold)' : '1px solid oklch(0.88 0.015 240)',
                }}
              >
                {/* Badge */}
                {service.badge && (
                  <div
                    className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold"
                    style={{
                      background: service.highlight ? 'var(--gold)' : 'var(--navy)',
                      color: service.highlight ? 'var(--navy)' : 'white',
                    }}
                  >
                    {service.badge}
                  </div>
                )}

                <div className="p-8">
                  {/* Icon */}
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-6"
                    style={{
                      background: service.highlight ? 'var(--gold)' : 'oklch(0.22 0.07 255 / 0.08)',
                    }}
                  >
                    <Icon
                      size={24}
                      style={{ color: service.highlight ? 'var(--navy)' : 'var(--navy)' }}
                    />
                  </div>

                  {/* Title */}
                  <h3
                    className="text-xl font-bold mb-1"
                    style={{ fontFamily: "'Playfair Display', serif", color: 'var(--navy)' }}
                  >
                    {service.title}
                  </h3>
                  <p className="text-sm font-medium mb-3" style={{ color: 'var(--gold)' }}>
                    {service.subtitle}
                  </p>
                  <p className="text-sm leading-relaxed mb-6" style={{ color: 'oklch(0.45 0.03 240)' }}>
                    {service.description}
                  </p>

                  {/* Features */}
                  <ul className="space-y-2 mb-6">
                    {service.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm" style={{ color: 'oklch(0.40 0.03 240)' }}>
                        <CheckCircle size={14} style={{ color: 'var(--gold)', flexShrink: 0 }} />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* Price */}
                  <div
                    className="flex items-baseline gap-2 mb-6 pb-6 border-b"
                    style={{ borderColor: 'oklch(0.92 0.01 240)' }}
                  >
                    <span
                      className="text-3xl font-bold"
                      style={{ fontFamily: "'Playfair Display', serif", color: 'var(--navy)' }}
                    >
                      {service.price}
                    </span>
                    <span className="text-sm" style={{ color: 'oklch(0.55 0.03 240)' }}>
                      {service.priceNote}
                    </span>
                  </div>

                  {/* Primary CTA */}
                  <button
                    onClick={() => handleBookSession(service.id)}
                    className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-200 mb-3"
                    style={{
                      background: 'var(--navy)',
                      color: 'white',
                      fontFamily: "'Inter', sans-serif",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--navy-light)';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'var(--navy)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <BookOpen size={16} />
                    Book a Session
                    <ArrowRight size={14} />
                  </button>

                  {/* Secondary CTAs */}
                  <div className="flex gap-2">
                    <a
                      href="https://wa.me/919424135055"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-lg text-xs font-semibold transition-all duration-200"
                      style={{
                        border: '1px solid oklch(0.88 0.015 240)',
                        color: 'oklch(0.40 0.03 240)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'oklch(0.95 0.01 240)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <MessageCircle size={12} />
                      WhatsApp
                    </a>
                    <button
                      onClick={() => setPaymentEnquiryOpen(true)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-lg text-xs font-semibold transition-all duration-200"
                      style={{
                        border: '1px solid var(--gold)',
                        color: 'oklch(0.55 0.14 75)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'oklch(0.72 0.12 75 / 0.08)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <CreditCard size={12} />
                      Pay Now
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Payment Enquiry CTA */}
        <div
          className="rounded-2xl p-10 text-center"
          style={{
            background: 'linear-gradient(135deg, var(--navy-dark) 0%, var(--navy) 100%)',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <h3
            className="text-3xl font-bold text-white mb-3"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Have a Payment Query?
          </h3>
          <p className="text-lg mb-8" style={{ color: 'oklch(0.80 0.02 240)' }}>
            Submit a payment enquiry and we'll get back to you within 24 hours.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => setPaymentEnquiryOpen(true)}
              className="btn-gold px-8 py-4 rounded-xl text-base"
            >
              <CreditCard size={18} />
              Submit Payment Enquiry
            </button>
            <button
              onClick={() => setStudentEnquiryOpen(true)}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-semibold transition-all duration-200"
              style={{
                border: '2px solid oklch(1 0 0 / 0.3)',
                color: 'white',
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
              <MessageCircle size={18} />
              General Enquiry
            </button>
          </div>
        </div>
      </div>

      <BookingFlowManager open={bookingOpen} onClose={() => setBookingOpen(false)} />
      {paymentEnquiryOpen && <PaymentEnquiryForm onClose={() => setPaymentEnquiryOpen(false)} />}
      {studentEnquiryOpen && <StudentEnquiryForm onBack={() => setStudentEnquiryOpen(false)} />}
    </section>
  );
};

export default Services;
