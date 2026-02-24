import React, { useState } from 'react';
import { BookOpen, Star, Users, Clock, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useGetCourseDetails, useRecordUPIPayment } from '../hooks/useQueries';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { UPI_ID, isMobileDevice } from '../utils/upiPayment';

export default function CourseOffering() {
  const { data: course, isLoading: courseLoading } = useGetCourseDetails();
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();
  const recordUPIPayment = useRecordUPIPayment();
  const [showPayment, setShowPayment] = useState(false);
  const [purchased, setPurchased] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const hasPurchased = purchased || userProfile?.hasPurchasedCourse === true;

  const handlePaymentConfirmed = async () => {
    setIsConfirming(true);
    try {
      await recordUPIPayment.mutateAsync();
      setPurchased(true);
      setShowPayment(false);
    } catch (error: any) {
      if (error?.message?.includes('already purchased')) {
        setPurchased(true);
        setShowPayment(false);
      }
    } finally {
      setIsConfirming(false);
    }
  };

  if (courseLoading || profileLoading) {
    return (
      <section className="py-16 px-4 bg-background">
        <div className="max-w-4xl mx-auto flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  const price = course ? Number(course.priceRupees) : 2499;
  const title = course?.title ?? 'Comprehensive Mathematics Program';
  const description = course?.description ?? 'A complete mathematics course for all learners.';

  const transactionNote = `Course: ${title}`;
  const encodedNote = encodeURIComponent(transactionNote);
  const upiUrl = `upi://pay?pa=${UPI_ID}&pn=Rajat%20Equation&am=${price.toFixed(2)}&cu=INR&tn=${encodedNote}`;
  const isMobile = isMobileDevice();

  return (
    <section id="course" className="py-16 px-4 bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <Badge variant="secondary" className="mb-3 text-xs font-semibold uppercase tracking-wider">
            Featured Course
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold font-serif text-primary mb-3">{title}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">{description}</p>
        </div>

        <div className="bg-card border border-border-warm rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-primary/5 border-b border-border-warm px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-foreground font-serif">{title}</h3>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> 4.9
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" /> 500+ students
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Self-paced
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-primary font-serif">
                ₹{price.toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-muted-foreground">One-time payment</p>
            </div>
          </div>

          <div className="px-6 py-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {[
                'Complete curriculum from basics to advanced',
                'Step-by-step problem solving techniques',
                'Topic-wise practice problems',
                'Progress tracking dashboard',
                'Lifetime access to materials',
                'Direct mentorship support',
              ].map((feature) => (
                <div key={feature} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">{feature}</span>
                </div>
              ))}
            </div>

            {hasPurchased ? (
              <div className="flex items-center justify-center gap-2 py-4 bg-green-50 rounded-xl border border-green-200">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-green-700">
                  Course Purchased — Enjoy Full Access!
                </span>
              </div>
            ) : (
              <Button
                onClick={() => setShowPayment(true)}
                className="w-full py-6 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-md"
              >
                Enroll Now — ₹{price.toLocaleString('en-IN')}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* UPI Payment Dialog */}
      <Dialog open={showPayment} onOpenChange={(open) => { if (!open) setShowPayment(false); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl text-primary">
              Complete Course Payment
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-2">
            <div className="text-center py-4 bg-navy/5 rounded-xl border border-navy/10">
              <p className="text-sm text-warm-text mb-1">Amount to Pay</p>
              <p className="text-4xl font-bold text-navy">₹{price.toLocaleString('en-IN')}</p>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-navy text-center">Pay via UPI</p>
              {isMobile ? (
                <a href={upiUrl} className="block">
                  <Button className="w-full bg-navy text-cream hover:bg-navy/90 h-12 text-base">
                    Open UPI App to Pay ₹{price.toLocaleString('en-IN')}
                  </Button>
                </a>
              ) : (
                <div className="text-center space-y-2">
                  <p className="text-sm text-warm-text">Use UPI ID:</p>
                  <p className="font-mono text-navy font-semibold text-lg">{UPI_ID}</p>
                  <p className="text-xs text-warm-text">
                    Use any UPI app (GPay, PhonePe, Paytm, etc.)
                  </p>
                </div>
              )}
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-xs text-amber-800 text-center">
                ⚠️ After completing the UPI payment, click the button below to confirm.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowPayment(false)}
                className="flex-1 border-border-warm"
              >
                Cancel
              </Button>
              <Button
                onClick={handlePaymentConfirmed}
                disabled={isConfirming}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold"
              >
                {isConfirming ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Confirming...
                  </span>
                ) : (
                  '✅ I have paid'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
