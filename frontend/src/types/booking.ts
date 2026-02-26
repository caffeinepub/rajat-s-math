export type BookingFormData = {
  name: string;
  phone: string;
  date: string;
  time: string;
  serviceType: string;
  classType: string;
  numberOfClasses: number;
  discountPercent: number;
  finalAmount: number;
};

export type BookingRecord = {
  name: string;
  phone: string;
  service: string;
  date: string;
  time: string;
  paymentId: string;
  paymentStatus: string;
  status: any;
  paymentConfirmedAt: any;
  classType: any;
  numberOfClasses: number;
  discountApplied: number;
  finalAmount: number;
  accessCode: string | null;
};

export type UpiPaymentParams = {
  amount: number;
  name: string;
  phone: string;
  service: string;
};
