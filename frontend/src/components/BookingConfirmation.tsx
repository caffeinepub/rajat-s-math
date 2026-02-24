import React from 'react';
import { Clock, Calendar, Phone, BookOpen, Hash, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BookingConfirmationProps {
  name: string;
  service: string;
  date: string;
  time: string;
  phone: string;
  paymentId: string;
  onClose: () => void;
}

export default function BookingConfirmation({
  name,
  service,
  date,
  time,
  phone,
  paymentId,
  onClose,
}: BookingConfirmationProps) {
  return (
    <div className="flex flex-col items-center gap-6 py-4">
      {/* Status Icon */}
      <div className="flex flex-col items-center gap-2">
        <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center">
          <Clock className="w-10 h-10 text-gold-dark" />
        </div>
        <h3 className="text-xl font-bold text-foreground font-serif">
          Awaiting Payment Confirmation
        </h3>
        <p className="text-sm text-muted-foreground text-center">
          Thank you, <span className="font-semibold text-primary">{name}</span>! Your booking request has been received. It will be marked as <strong>Completed</strong> once your UPI payment is verified by our team.
        </p>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-200">
        <AlertCircle className="w-4 h-4 text-amber-600" />
        <span className="text-sm font-semibold text-amber-700">Status: Awaiting Payment Verification</span>
      </div>

      {/* Booking Details */}
      <div className="w-full bg-muted/30 border border-border-warm rounded-xl p-4 space-y-3">
        <h4 className="text-sm font-semibold text-foreground mb-3">Booking Details</h4>

        <div className="flex items-center gap-3">
          <BookOpen className="w-4 h-4 text-primary flex-shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">Service</p>
            <p className="text-sm font-medium text-foreground">{service}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">Date</p>
            <p className="text-sm font-medium text-foreground">{date}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Clock className="w-4 h-4 text-primary flex-shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">Time</p>
            <p className="text-sm font-medium text-foreground">{time}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Phone className="w-4 h-4 text-primary flex-shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">Contact</p>
            <p className="text-sm font-medium text-foreground">{phone}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Hash className="w-4 h-4 text-primary flex-shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">Payment Reference</p>
            <p className="text-sm font-mono font-medium text-foreground">{paymentId}</p>
          </div>
        </div>
      </div>

      {/* Payment Note */}
      <div className="w-full bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
        <p className="text-xs text-blue-800 dark:text-blue-200 text-center">
          💳 UPI payment submitted. Our team will verify your payment and confirm your session shortly. Please save your UPI transaction ID for reference.
        </p>
      </div>

      <Button
        onClick={onClose}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-xl"
      >
        Done
      </Button>
    </div>
  );
}
