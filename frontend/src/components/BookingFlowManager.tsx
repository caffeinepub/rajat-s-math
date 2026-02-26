import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import BookingForm from './BookingForm';
import BookingConfirmation from './BookingConfirmation';
import UpiPaymentStep from './UpiPaymentStep';

interface BookingFlowManagerProps {
  open: boolean;
  onClose: () => void;
  defaultService?: string;
  preSelectedService?: string;
}

type FlowStep = 'form' | 'payment' | 'confirmation';

// Named export for backward compatibility with existing imports
export function BookingFlowManager({
  open,
  onClose,
  defaultService,
  preSelectedService,
}: BookingFlowManagerProps) {
  const [step, setStep] = useState<FlowStep>('form');
  const [bookingData, setBookingData] = useState<any>(null);
  const [discountInfo, setDiscountInfo] = useState<{
    discountPercent: number;
    finalAmount: number;
    discountCode: string;
  } | null>(null);

  const handleFormSubmit = (data: any) => {
    setBookingData(data);
    setStep('payment');
  };

  const handlePaymentConfirm = (
    discountPercent: number,
    finalAmount: number,
    discountCode?: string
  ) => {
    setDiscountInfo({ discountPercent, finalAmount, discountCode: discountCode ?? '' });
    setStep('confirmation');
  };

  const handleClose = () => {
    setStep('form');
    setBookingData(null);
    setDiscountInfo(null);
    onClose();
  };

  const resolvedService = defaultService ?? preSelectedService;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === 'form'
              ? 'Book a Session'
              : step === 'payment'
              ? 'Complete Payment'
              : 'Booking Confirmed'}
          </DialogTitle>
        </DialogHeader>

        {step === 'form' && (
          <BookingForm
            defaultService={resolvedService}
            onSubmit={handleFormSubmit}
          />
        )}

        {step === 'payment' && bookingData && (
          <UpiPaymentStep
            amount={bookingData.finalAmount ?? 0}
            bookingName={bookingData.name ?? ''}
            service={bookingData.serviceType ?? bookingData.service ?? ''}
            classType={bookingData.classType === 'group' ? 'group' : 'oneOnOne'}
            numberOfClasses={bookingData.numberOfClasses ?? 1}
            onConfirm={handlePaymentConfirm}
            onBack={() => setStep('form')}
          />
        )}

        {step === 'confirmation' && bookingData && (
          <BookingConfirmation
            name={bookingData.name ?? ''}
            phone={bookingData.phone ?? ''}
            service={bookingData.serviceType ?? bookingData.service ?? ''}
            date={bookingData.date ?? ''}
            time={bookingData.time ?? ''}
            classType={bookingData.classType ?? 'oneOnOne'}
            numberOfClasses={bookingData.numberOfClasses ?? 1}
            discountCode={discountInfo?.discountCode}
            discountPercent={discountInfo?.discountPercent}
            finalAmount={discountInfo?.finalAmount ?? bookingData.finalAmount ?? 0}
            onClose={handleClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

// Default export for components that use default import
export default BookingFlowManager;
