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
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : '';
      if (msg.includes('already purchased')) {
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
                <h3 className="font-bold text-foreground font-serif text-lg">{title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-3.5 h-3.5 fill-gold text-gold" />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">Top Rated</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-primary">₹{price.toLocaleString('en-IN')}</p>
              <p className="text-xs text-muted-foreground">One-time payment</p>
            </div>
          </div>

          <div className="px-6 py-5 grid sm:grid-cols-3 gap-4 border-b border-border-warm">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Self-paced learning</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">All skill levels</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Certificate included</span>
            </div>
          </div>

          <div className="px-6 py-5">
            {hasPurchased ? (
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-green-800">Course Purchased!</p>
                  <p className="text-sm text-green-600">You have full access to all course materials.</p>
                </div>
              </div>
            ) : (
              <Button
                onClick={() => setShowPayment(true)}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-6 text-lg rounded-xl"
              >
                Enroll Now — ₹{price.toLocaleString('en-IN')}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* UPI Payment Dialog */}
      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent className="booking-dialog-content max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-serif text-primary">Complete Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="text-center py-4 bg-primary/5 rounded-xl border border-primary/10">
              <p className="text-sm text-muted-foreground mb-1">Amount to Pay</p>
              <p className="text-4xl font-bold text-primary">₹{price.toLocaleString('en-IN')}</p>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground text-center">Pay via UPI</p>
              {isMobile ? (
                <a href={upiUrl} className="block">
                  <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-base">
                    Open UPI App to Pay
                  </Button>
                </a>
              ) : (
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">Use UPI ID:</p>
                  <p className="font-mono text-primary font-semibold text-lg">{UPI_ID}</p>
                  <p className="text-xs text-muted-foreground">Use any UPI app (GPay, PhonePe, Paytm, etc.)</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowPayment(false)}
                className="flex-1"
                disabled={isConfirming}
              >
                Cancel
              </Button>
              <Button
                onClick={handlePaymentConfirmed}
                disabled={isConfirming}
                className="flex-1 bg-gold text-navy hover:bg-gold/90 font-semibold"
              >
                {isConfirming ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "I've Paid ✓"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
