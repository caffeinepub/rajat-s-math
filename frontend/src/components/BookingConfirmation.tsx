import React from 'react';
import { CheckCircle, Calendar, Clock, User, Phone, BookOpen, Tag, DollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface BookingConfirmationProps {
  name: string;
  phone: string;
  service: string;
  date: string;
  time: string;
  classType: string;
  numberOfClasses: number;
  discountCode?: string;
  discountPercent?: number;
  finalAmount: number;
  onClose?: () => void;
}

export default function BookingConfirmation({
  name,
  phone,
  service,
  date,
  time,
  classType,
  numberOfClasses,
  discountCode,
  discountPercent,
  finalAmount,
  onClose,
}: BookingConfirmationProps) {
  return (
    <div className="space-y-6 text-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
          <CheckCircle className="w-9 h-9 text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Booking Confirmed!</h2>
          <p className="text-muted-foreground mt-1">
            Your session has been successfully booked.
          </p>
        </div>
      </div>

      <div className="bg-muted/30 rounded-xl p-4 text-left space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <User className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="text-muted-foreground">Name:</span>
          <span className="font-medium text-foreground">{name}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="text-muted-foreground">Phone:</span>
          <span className="font-medium text-foreground">{phone}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <BookOpen className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="text-muted-foreground">Service:</span>
          <span className="font-medium text-foreground">{service}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="text-muted-foreground">Date:</span>
          <span className="font-medium text-foreground">{date}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="text-muted-foreground">Time:</span>
          <span className="font-medium text-foreground">{time}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Class Type:</span>
          <span className="font-medium text-foreground capitalize">
            {classType === 'oneOnOne' ? '1-on-1' : classType}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Classes:</span>
          <span className="font-medium text-foreground">{numberOfClasses}</span>
        </div>
        {discountCode && discountPercent && discountPercent > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <Tag className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground">Discount:</span>
            <Badge variant="secondary" className="text-xs">
              {discountCode} ({discountPercent}% off)
            </Badge>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm border-t border-border pt-2 mt-2">
          <DollarSign className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="text-muted-foreground">Total Amount:</span>
          <span className="font-bold text-foreground text-base">₹{finalAmount}</span>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-950/20 rounded-xl p-4 text-sm text-left space-y-1 border border-blue-200 dark:border-blue-800">
        <p className="font-semibold text-foreground">Next Steps:</p>
        <p className="text-muted-foreground">1. Complete payment via UPI or the provided link.</p>
        <p className="text-muted-foreground">2. You'll receive a confirmation once payment is verified.</p>
        <p className="text-muted-foreground">3. An access code will be sent to join the student portal.</p>
      </div>

      {onClose && (
        <Button onClick={onClose} className="w-full">
          Done
        </Button>
      )}
    </div>
  );
}
