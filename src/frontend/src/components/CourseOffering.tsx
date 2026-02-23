import { CheckCircle, LogIn, BookOpen, Award, Target, Sparkles, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Skeleton } from './ui/skeleton';
import { toast } from 'sonner';

export function CourseOffering() {
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();
  const { identity } = useInternetIdentity();

  const isAuthenticated = !!identity;
  const hasPurchased = userProfile?.hasPurchasedCourse || false;

  const handleUPIPayment = () => {
    const upiId = '9424135055@ptyes';
    const payeeName = encodeURIComponent("Rajat's Equation");
    const upiUrl = `upi://pay?pa=${upiId}&pn=${payeeName}`;
    
    // Open UPI payment link
    window.location.href = upiUrl;
    
    toast.info('Opening UPI payment app. After payment, please contact us on WhatsApp to confirm.');
  };

  if (isAuthenticated && profileLoading) {
    return (
      <section id="course-offering" className="scroll-mt-8 py-16 bg-gradient-to-br from-[oklch(0.96_0.02_40)] to-[oklch(0.98_0.01_140)]">
        <div className="container mx-auto px-4">
          <Skeleton className="h-12 w-96 mx-auto mb-4" />
          <Skeleton className="h-96 w-full max-w-4xl mx-auto" />
        </div>
      </section>
    );
  }

  const benefits = [
    { icon: BookOpen, text: 'Comprehensive coverage of all mathematical topics' },
    { icon: Target, text: 'Topic-wise practice with instant feedback' },
    { icon: Award, text: 'Detailed progress tracking and analytics' },
    { icon: Sparkles, text: 'Step-by-step solutions for every problem' }
  ];

  return (
    <section id="course-offering" className="scroll-mt-8 py-16 bg-gradient-to-br from-[oklch(0.96_0.02_40)] to-[oklch(0.98_0.01_140)]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-[oklch(0.20_0.05_240)] text-white px-4 py-2 text-sm">
            Premium Access
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-[oklch(0.20_0.05_240)] mb-4 font-serif">
            Master Mathematical Thinking
          </h2>
          <p className="text-lg text-[oklch(0.50_0.05_40)] max-w-2xl mx-auto">
            Get unlimited access to our complete mathematics learning platform
          </p>
        </div>

        <Card className="max-w-4xl mx-auto border-2 border-[oklch(0.85_0.03_40)] shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-[oklch(0.20_0.05_240)] to-[oklch(0.30_0.08_240)] p-8 text-white">
            <CardHeader className="p-0">
              <CardTitle className="text-3xl md:text-4xl font-bold mb-2 font-serif">
                Comprehensive Mathematics Program
              </CardTitle>
              <CardDescription className="text-white/90 text-lg">
                A complete mathematics course designed for all learners, emphasizing mathematical thinking and problem-solving skills
              </CardDescription>
            </CardHeader>
          </div>

          <CardContent className="p-8 space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-[oklch(0.60_0.12_140)] flex items-center justify-center flex-shrink-0">
                    <benefit.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-[oklch(0.40_0.08_40)] font-medium leading-relaxed">
                      {benefit.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t-2 border-[oklch(0.90_0.02_40)] pt-8">
              <h3 className="text-2xl font-bold text-[oklch(0.35_0.08_40)] mb-4">
                What You'll Learn
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  'Calculus fundamentals and applications',
                  'Algebraic reasoning and techniques',
                  'Coordinate geometry mastery',
                  'Trigonometric problem-solving',
                  'Vector mathematics',
                  'Probability and statistics'
                ].map((topic, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-[oklch(0.60_0.12_140)] flex-shrink-0" />
                    <span className="text-[oklch(0.45_0.05_40)]">{topic}</span>
                  </div>
                ))}
              </div>
            </div>

            {!isAuthenticated ? (
              <div className="bg-[oklch(0.97_0.01_80)] p-6 rounded-xl border-2 border-[oklch(0.88_0.03_40)] text-center">
                <LogIn className="w-12 h-12 mx-auto mb-4 text-[oklch(0.55_0.15_40)]" />
                <h4 className="text-xl font-bold text-[oklch(0.35_0.08_40)] mb-2">
                  Login to Access Course
                </h4>
                <p className="text-[oklch(0.50_0.05_40)]">
                  Please login to view course details and purchase options
                </p>
              </div>
            ) : hasPurchased ? (
              <div className="bg-gradient-to-r from-[oklch(0.95_0.02_140)] to-[oklch(0.96_0.02_140)] p-6 rounded-xl border-2 border-[oklch(0.60_0.12_140)] text-center">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-[oklch(0.60_0.12_140)]" />
                <h4 className="text-xl font-bold text-[oklch(0.35_0.08_40)] mb-2">
                  Course Access Activated!
                </h4>
                <p className="text-[oklch(0.50_0.05_40)]">
                  You have full access to all course features and materials
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-[oklch(0.97_0.01_80)] p-6 rounded-xl border-2 border-[oklch(0.88_0.03_40)]">
                  <h4 className="text-xl font-bold text-[oklch(0.35_0.08_40)] mb-4">
                    Payment Instructions
                  </h4>
                  <div className="space-y-3 text-[oklch(0.45_0.05_40)]">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-[oklch(0.60_0.12_140)] text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">
                        1
                      </div>
                      <p>Click the "Pay with UPI" button below to open your UPI payment app</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-[oklch(0.60_0.12_140)] text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">
                        2
                      </div>
                      <p>Complete the payment using UPI ID: <strong className="text-[oklch(0.35_0.08_40)]">9424135055@ptyes</strong></p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-[oklch(0.60_0.12_140)] text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">
                        3
                      </div>
                      <p>After payment, contact us on WhatsApp to confirm and activate your access</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    onClick={handleUPIPayment}
                    className="flex-1 bg-[oklch(0.60_0.12_140)] hover:bg-[oklch(0.55_0.12_140)] text-white text-lg py-6"
                  >
                    Pay with UPI
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="flex-1 border-2 border-[oklch(0.60_0.12_140)] text-[oklch(0.50_0.10_140)] hover:bg-[oklch(0.95_0.02_140)] text-lg py-6"
                  >
                    <a
                      href="https://wa.me/919424135055"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="w-5 h-5 mr-2" />
                      Contact on WhatsApp
                    </a>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
