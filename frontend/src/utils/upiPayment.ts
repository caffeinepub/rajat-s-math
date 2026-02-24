/**
 * UPI Payment utility for generating UPI deep link URLs
 * UPI ID: 9424135055@ptyes
 */

export const UPI_ID = '9424135055@ptyes';
export const PAYEE_NAME = 'Rajat%20Equation';

export interface UpiPaymentParams {
  amount: number; // in rupees
  transactionNote: string;
}

export function generateUpiUrl(params: UpiPaymentParams): string {
  const { amount, transactionNote } = params;
  if (amount <= 0) throw new Error('Amount must be positive');
  const encodedNote = encodeURIComponent(transactionNote);
  return `upi://pay?pa=${UPI_ID}&pn=${PAYEE_NAME}&am=${amount.toFixed(2)}&cu=INR&tn=${encodedNote}`;
}

export function isMobileDevice(): boolean {
  return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    || window.innerWidth < 768;
}
