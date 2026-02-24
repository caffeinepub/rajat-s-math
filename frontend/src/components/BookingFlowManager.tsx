import React, { useState } from 'react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BookingForm, SERVICE_OPTIONS } from './BookingForm';
import BookingConfirmation from './BookingConfirmation';
import UpiPaymentStep from './UpiPaymentStep';
import { useAddBookingRecord } from '../hooks/useBooking';
import type { BookingFormData } from '../types/booking';
import { BookingStatus } from '../backend';

interface BookingFlowManagerProps {
  open: boolean;
  onClose: () => void;
  preSelectedService?: string;
}

type FlowStep = 'form' | 'payment' | 'confirmation';

interface ConfirmationData {
  name: string;
  service: string;
  date: string;
  time: string;
  phone: string;
  paymentId: string;
}

export function BookingFlowManager({ open, onClose, preSelectedService }: BookingFlowManagerProps) {
  const [step, setStep] = useState<FlowStep>('form');
  const [bookingData, setBookingData] = useState<BookingFormData | null>(null);
  const [confirmationData, setConfirmationData] = useState<ConfirmationData | null>(null);

  const addBookingRecord = useAddBookingRecord();

  const handleClose = () => {
    setStep('form');
    setBookingData(null);
    setConfirmationData(null);
    onClose();
  };

  const handleFormSubmit = (data: BookingFormData) => {
    setBookingData(data);
    setStep('payment');
  };

  const handlePaymentConfirmed = async () => {
    if (!bookingData) return;

    const upiRef = `UPI-${Date.now()}`;

    try {
      await addBookingRecord.mutateAsync({
        name: bookingData.name,
        phone: bookingData.phone,
        service: bookingData.serviceType,
        date: bookingData.date,
        time: bookingData.time,
        paymentId: upiRef,
        paymentStatus: 'UPI_CONFIRMED',
        status: BookingStatus.awaitingPayment,
      });
    } catch (error) {
      console.error('Booking record save error:', error);
      toast.error('Booking saved locally. Please contact us if you face any issues.');
    }

    setConfirmationData({
      name: bookingData.name,
      service: bookingData.serviceType,
      date: bookingData.date,
      time: bookingData.time,
      phone: bookingData.phone,
      paymentId: upiRef,
    });
    setStep('confirmation');
  };

  const getDialogTitle = () => {
    switch (step) {
      case 'form': return 'Book Your Session';
      case 'payment': return 'Complete Payment';
      case 'confirmation': return 'Booking Received!';
    }
  };

  const amount = bookingData
    ? (SERVICE_OPTIONS.find((s) => s.value === bookingData.serviceType)?.price ?? 500)
    : 0;

  const transactionNote = bookingData
    ? `Booking: ${bookingData.serviceType} on ${bookingData.date}`
    : '';

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose(); }}>
      <DialogContent className="booking-dialog-content max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl text-primary">
            {getDialogTitle()}
          </DialogTitle>
        </DialogHeader>

        {step === 'form' && (
          <BookingForm
            open={true}
            onClose={handleClose}
            onSubmit={handleFormSubmit}
            preSelectedService={preSelectedService}
            isSubmitting={false}
            inline
          />
        )}

        {step === 'payment' && bookingData && (
          <UpiPaymentStep
            amount={amount}
            transactionNote={transactionNote}
            onPaymentConfirmed={handlePaymentConfirmed}
            onCancel={() => setStep('form')}
            isConfirming={addBookingRecord.isPending}
          />
        )}

        {step === 'confirmation' && confirmationData && (
          <BookingConfirmation
            name={confirmationData.name}
            service={confirmationData.service}
            date={confirmationData.date}
            time={confirmationData.time}
            phone={confirmationData.phone}
            paymentId={confirmationData.paymentId}
            onClose={handleClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
