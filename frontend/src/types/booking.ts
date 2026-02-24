import { ClassType } from '../backend';

export interface BookingFormData {
  name: string;
  phone: string;
  date: string;
  time: string;
  serviceType: string;
  classType: ClassType;
  numberOfClasses: number;
  discountPercent: number;
  finalAmount: number;
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
