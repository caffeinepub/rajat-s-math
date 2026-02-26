import { useState } from 'react';
import { MessageCircle, CreditCard, Users, User, FileText, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { AuthGate } from './AuthGate';
import { BookingFlowManager } from './BookingFlowManager';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import PaymentEnquiryForm from './PaymentEnquiryForm';

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
  const [enquiryOpen, setEnquiryOpen] = useState(false);

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

                {/* Book a Session — Primary CTA, clearly visible */}
                <div className="mt-auto pt-2">
                  <AuthGate onAction={() => openBooking(course.title)}>
                    <button
                      type="button"
                      className="flex items-center justify-center gap-2 w-full px-4 py-3.5 rounded-lg bg-navy hover:bg-navy/90 text-cream font-bold transition-colors shadow-lg text-base border-2 border-navy hover:border-navy/90"
                    >
                      <BookOpen className="w-5 h-5" />
                      Book a Session
                    </button>
                  </AuthGate>
                </div>

                {/* Secondary Action Buttons */}
                <div className="flex flex-col gap-2">
                  <AuthGate onAction={() => window.open(buildWhatsAppLink(course.title), '_blank', 'noopener,noreferrer')}>
                    <button
                      type="button"
                      className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-[oklch(0.45_0.15_145)] hover:bg-[oklch(0.40_0.15_145)] text-white font-semibold transition-colors shadow-md text-sm"
                    >
                      <MessageCircle className="w-4 h-4" />
                      📲 Book Demo on WhatsApp
                    </button>
                  </AuthGate>
                  <AuthGate onAction={() => openBooking(course.title)}>
                    <button
                      type="button"
                      className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-gold hover:bg-gold-dark text-white font-semibold transition-colors shadow-md text-sm"
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

        {/* Payment Enquiry CTA */}
        <div className="mt-12 max-w-2xl mx-auto">
          <div className="rounded-2xl border-2 border-navy/20 bg-white shadow-lg p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-full bg-navy/10 flex items-center justify-center">
                <FileText className="w-7 h-7 text-navy" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-navy font-serif mb-2">Payment Enquiry</h3>
            <p className="text-warm-text mb-6 text-sm leading-relaxed">
              Have a question about your fee payment? Submit a payment enquiry with your details and the duration you're paying for — our team will get back to you promptly.
            </p>
            <button
              type="button"
              onClick={() => setEnquiryOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-lg bg-navy text-cream font-semibold hover:bg-navy/90 transition-colors shadow-md"
            >
              <FileText className="w-4 h-4" />
              Submit Payment Enquiry
            </button>
          </div>
        </div>
      </div>

      {/* Booking flow modal */}
      <BookingFlowManager
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        preSelectedService={selectedService}
      />

      {/* Payment Enquiry Dialog */}
      <Dialog open={enquiryOpen} onOpenChange={setEnquiryOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">Payment Enquiry Form</DialogTitle>
            <DialogDescription>
              Fill in your details and the payment duration. No login required.
            </DialogDescription>
          </DialogHeader>
          <PaymentEnquiryForm onClose={() => setEnquiryOpen(false)} />
        </DialogContent>
      </Dialog>
    </section>
  );
}
