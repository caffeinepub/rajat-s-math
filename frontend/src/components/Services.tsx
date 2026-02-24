import { useState } from 'react';
import { MessageCircle, CreditCard, Users, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { AuthGate } from './AuthGate';
import { BookingFlowManager } from './BookingFlowManager';

const WA_NUMBER = '919424135055';

function buildWhatsAppLink(courseName: string) {
  const msg = encodeURIComponent(`Hi, I want to book a demo for ${courseName}`);
  return `https://wa.me/${WA_NUMBER}?text=${msg}`;
}

interface Course {
  title: string;
  subtitle?: string;
  groupPrice: string;
  oneToOnePrice: string;
  badge?: string;
}

const courses: Course[] = [
  {
    title: 'Class 10 Boards Full Prep',
    subtitle: 'Any Board – Online',
    groupPrice: '₹250/hour',
    oneToOnePrice: '₹350/hour',
    badge: 'Class 10',
  },
  {
    title: 'Class 12 Boards Full Prep',
    subtitle: 'Online',
    groupPrice: '₹300/hour',
    oneToOnePrice: '₹400/hour',
    badge: 'Class 12',
  },
  {
    title: 'JEE Foundation',
    subtitle: 'Online',
    groupPrice: '₹350/hour',
    oneToOnePrice: '₹450/hour',
    badge: 'JEE',
  },
  {
    title: 'JEE Full Course Prep',
    subtitle: 'Online',
    groupPrice: '₹400/hour',
    oneToOnePrice: '₹500/hour',
    badge: 'JEE',
  },
  {
    title: 'IOQM / NMTC / Other Olympiads Prep',
    subtitle: 'Online',
    groupPrice: '₹400/hour',
    oneToOnePrice: '₹500/hour',
    badge: 'Olympiad',
  },
  {
    title: 'How to Think in Math',
    subtitle: 'Full Course – 3 Months',
    groupPrice: '₹1,999 for 3 months',
    oneToOnePrice: '₹300/hour',
    badge: '3-Month Course',
  },
];

export function Services() {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string | undefined>();

  const openBooking = (serviceName: string) => {
    setSelectedService(serviceName);
    setBookingOpen(true);
  };

  return (
    <section id="services" className="scroll-mt-8 py-20 bg-gradient-to-br from-cream to-warm-light">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-navy mb-4 font-serif">
            Courses &amp; Pricing
          </h2>
          <p className="text-lg md:text-xl text-warm-text max-w-2xl mx-auto">
            All courses are in <strong>Mathematics</strong>. Choose the format that suits you best — group classes or personalised one-to-one sessions.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {courses.map((course, index) => (
            <Card
              key={index}
              className="border-2 border-border-warm hover:border-navy transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 bg-white flex flex-col"
            >
              <CardHeader className="pb-3">
                {course.badge && (
                  <span className="inline-block self-start mb-3 px-3 py-1 rounded-full text-xs font-bold bg-gold/20 text-gold-dark border border-gold/40 tracking-wide uppercase">
                    {course.badge}
                  </span>
                )}
                <CardTitle className="text-xl font-bold text-navy leading-snug">
                  {course.title}
                </CardTitle>
                {course.subtitle && (
                  <p className="text-sm text-warm-text mt-1">{course.subtitle}</p>
                )}
              </CardHeader>

              <CardContent className="flex flex-col flex-1 gap-4">
                {/* Pricing */}
                <div className="rounded-xl overflow-hidden border border-border-warm">
                  <div className="flex items-center gap-3 px-4 py-3 bg-navy/5 border-b border-border-warm">
                    <Users className="w-4 h-4 text-navy shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-navy/70 uppercase tracking-wide">Group Class – Online</p>
                      <p className="text-lg font-bold text-navy">{course.groupPrice}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-3 bg-gold/5">
                    <User className="w-4 h-4 text-gold-dark shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-gold-dark/80 uppercase tracking-wide">One-to-One Class</p>
                      <p className="text-lg font-bold text-gold-dark">{course.oneToOnePrice}</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons — auth gated */}
                <div className="flex flex-col gap-3 mt-auto pt-2">
                  <AuthGate onAction={() => window.open(buildWhatsAppLink(course.title), '_blank', 'noopener,noreferrer')}>
                    <button
                      type="button"
                      className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg bg-[oklch(0.45_0.15_145)] hover:bg-[oklch(0.40_0.15_145)] text-white font-semibold transition-colors shadow-md text-sm"
                    >
                      <MessageCircle className="w-4 h-4" />
                      📲 Book Demo on WhatsApp
                    </button>
                  </AuthGate>
                  <AuthGate onAction={() => openBooking(course.title)}>
                    <button
                      type="button"
                      className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg bg-gold hover:bg-gold-dark text-white font-semibold transition-colors shadow-md text-sm"
                    >
                      <CreditCard className="w-4 h-4" />
                      💳 Book &amp; Pay Now
                    </button>
                  </AuthGate>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="text-center text-sm text-warm-text mt-10 opacity-70">
          Secure payments via UPI — Google Pay, PhonePe, Paytm &amp; all UPI apps
        </p>
      </div>

      {/* Booking flow modal — rendered once at section level */}
      <BookingFlowManager
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        preSelectedService={selectedService}
      />
    </section>
  );
}
