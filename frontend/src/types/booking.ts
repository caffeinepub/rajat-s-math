export interface BookingFormData {
  name: string;
  phone: string;
  date: string;
  time: string;
  serviceType: string;
}

export interface BookingRecord {
  name: string;
  phone: string;
  service: string;
  date: string;
  time: string;
  paymentId: string;
  paymentStatus: string;
}

export interface UpiPaymentParams {
  amount: number;
  transactionNote: string;
}
