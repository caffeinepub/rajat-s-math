import React, { useState } from 'react';
import { useGetCourseDetails, useRecordUPIPayment } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { CheckCircle, BookOpen, IndianRupee } from 'lucide-react';

export default function CourseOffering() {
  const { identity } = useInternetIdentity();
  const { data: course, isLoading } = useGetCourseDetails();
  const recordPayment = useRecordUPIPayment();
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentRef, setPaymentRef] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">Loading course details...</div>
    );
  }

  if (!course) return null;

  const handlePaymentSubmit = async () => {
    try {
      await recordPayment.mutateAsync({
        user: identity?.getPrincipal(),
        timestamp: BigInt(Date.now()) * BigInt(1_000_000),
        method: 'UPI',
        confirmed: false,
        referenceId: paymentRef,
      });
      setSubmitted(true);
    } catch (err) {
      console.error('Failed to record payment:', err);
    }
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-6 space-y-4 max-w-md mx-auto">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">{course.title}</h3>
          <p className="text-sm text-muted-foreground">{course.description}</p>
        </div>
      </div>

      <div className="flex items-center gap-1 text-2xl font-bold text-foreground">
        <IndianRupee className="w-5 h-5" />
        {String(course.priceRupees)}
      </div>

      {identity ? (
        <Button
          className="w-full"
          onClick={() => setShowPaymentDialog(true)}
          disabled={!course.isPaid}
        >
          Enroll Now
        </Button>
      ) : (
        <p className="text-sm text-muted-foreground text-center">Login to enroll</p>
      )}

      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Payment</DialogTitle>
            <DialogDescription>
              Pay ₹{String(course.priceRupees)} via UPI and enter your reference ID below.
            </DialogDescription>
          </DialogHeader>

          {submitted ? (
            <div className="text-center py-6 space-y-3">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
              <p className="font-semibold text-foreground">Payment Submitted!</p>
              <p className="text-sm text-muted-foreground">
                Your payment will be verified and access granted shortly.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground block mb-1">
                  UPI Reference ID
                </label>
                <input
                  type="text"
                  placeholder="Enter UPI transaction ID"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground"
                />
              </div>
              <Button
                className="w-full"
                onClick={handlePaymentSubmit}
                disabled={recordPayment.isPending || !paymentRef.trim()}
              >
                {recordPayment.isPending ? 'Submitting...' : 'Submit Payment'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
