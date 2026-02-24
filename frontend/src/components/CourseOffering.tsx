import React, { useState } from 'react';
import { BookOpen, Star, Users, Clock, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGetCourseDetails, useRecordUPIPayment } from '../hooks/useQueries';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import UpiPaymentStep from './UpiPaymentStep';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function CourseOffering() {
  const { data: course, isLoading: courseLoading } = useGetCourseDetails();
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();
  const recordUPIPayment = useRecordUPIPayment();
  const [showPayment, setShowPayment] = useState(false);
  const [purchased, setPurchased] = useState(false);

  const hasPurchased = purchased || userProfile?.hasPurchasedCourse === true;

  const handlePaymentConfirmed = async () => {
    try {
      await recordUPIPayment.mutateAsync();
      setPurchased(true);
      setShowPayment(false);
    } catch (error: any) {
      // If already purchased, still mark as purchased
      if (error?.message?.includes('already purchased')) {
        setPurchased(true);
        setShowPayment(false);
      }
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

  return (
    <section id="course" className="py-16 px-4 bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-10">
          <Badge variant="secondary" className="mb-3 text-xs font-semibold uppercase tracking-wider">
            Featured Course
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold font-serif text-primary mb-3">
            {title}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {description}
          </p>
        </div>

        {/* Course Card */}
        <div className="bg-card border border-border-warm rounded-2xl shadow-lg overflow-hidden">
          {/* Card Header */}
          <div className="bg-primary/5 border-b border-border-warm px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-foreground font-serif">{title}</h3>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                  <span className="flex items-center gap-1"><Star className="w-3 h-3 fill-amber-400 text-amber-400" /> 4.9</span>
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" /> 500+ students</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Self-paced</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-primary font-serif">₹{price.toLocaleString('en-IN')}</p>
              <p className="text-xs text-muted-foreground">One-time payment</p>
            </div>
          </div>

          {/* Features */}
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

            {/* CTA */}
            {hasPurchased ? (
              <div className="flex items-center justify-center gap-2 py-4 bg-green-50 dark:bg-green-950/20 rounded-xl border border-green-200 dark:border-green-800">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-green-700 dark:text-green-400">
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
          <UpiPaymentStep
            amount={price}
            transactionNote={`Course: ${title}`}
            onPaymentConfirmed={handlePaymentConfirmed}
            onCancel={() => setShowPayment(false)}
            isConfirming={recordUPIPayment.isPending}
          />
        </DialogContent>
      </Dialog>
    </section>
  );
}
