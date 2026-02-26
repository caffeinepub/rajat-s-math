import React, { useState } from 'react';
import { useAddPaymentEnquiry } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, Copy, Check, Loader2 } from 'lucide-react';

interface PaymentEnquiryFormProps {
  onClose: () => void;
}

const FEE_TYPES = [
  'Monthly Fee',
  'Quarterly Fee',
  'Half-Yearly Fee',
  'Annual Fee',
  'Per Session Fee',
  'Course Package',
];

export default function PaymentEnquiryForm({ onClose }: PaymentEnquiryFormProps) {
  const [studentName, setStudentName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [feeType, setFeeType] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [durationStart, setDurationStart] = useState('');
  const [durationEnd, setDurationEnd] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [referenceId, setReferenceId] = useState('');
  const [copied, setCopied] = useState(false);

  const addPaymentEnquiry = useAddPaymentEnquiry();

  const generateReferenceId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'PAY-';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!studentName.trim()) newErrors.studentName = 'Name is required';
    if (!contactNumber.trim()) newErrors.contactNumber = 'Contact number is required';
    if (!feeType) newErrors.feeType = 'Fee type is required';
    if (!amountStr.trim() || isNaN(Number(amountStr)) || Number(amountStr) <= 0) {
      newErrors.amount = 'Valid amount is required';
    }
    if (!durationStart) newErrors.durationStart = 'Start date is required';
    if (!durationEnd) newErrors.durationEnd = 'End date is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const refId = generateReferenceId();
    const parsedAmount = BigInt(Math.round(Number(amountStr)));

    try {
      await addPaymentEnquiry.mutateAsync({
        studentName: studentName.trim(),
        contactNumber: contactNumber.trim(),
        feeType,
        amount: parsedAmount,
        durationStart,
        durationEnd,
        paymentReferenceId: refId,
      });
      setReferenceId(refId);
      setSubmitted(true);
    } catch {
      // handled by mutation state
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(referenceId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const upiId = '9424135055@ptyes';
  const upiQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    `upi://pay?pa=${upiId}&pn=Rajat's Equation&am=${amountStr}&tn=${referenceId}`
  )}`;

  if (submitted) {
    return (
      <div className="space-y-4 py-2">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-7 h-7 text-green-600" />
          </div>
        </div>

        <div className="text-center">
          <h3 className="font-serif font-bold text-navy text-lg">Enquiry Submitted!</h3>
          <p className="text-warm-text text-sm mt-1">
            Please complete your payment using the QR code below.
          </p>
        </div>

        <div className="bg-navy/5 border border-navy/20 rounded-lg p-3 text-center">
          <p className="text-xs text-warm-text mb-1 font-medium uppercase tracking-wide">
            Payment Reference ID
          </p>
          <div className="flex items-center justify-center gap-2">
            <code className="font-mono font-bold text-navy">{referenceId}</code>
            <button
              onClick={handleCopy}
              className="p-1 rounded hover:bg-navy/10 transition-colors"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-green-600" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-navy/60" />
              )}
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <p className="text-sm font-medium text-navy">Scan to Pay via UPI</p>
          <img src={upiQrUrl} alt="UPI QR Code" className="w-40 h-40 rounded-lg border border-border-warm" />
          <p className="text-xs text-warm-text">UPI ID: {upiId}</p>
          <p className="text-sm font-semibold text-navy">Amount: ₹{amountStr}</p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
          <p className="text-amber-700 text-xs font-medium">⏳ Awaiting Confirmation</p>
          <p className="text-amber-600 text-xs mt-0.5">
            Share the reference ID with admin after payment.
          </p>
        </div>

        <Button onClick={onClose} className="w-full bg-navy text-cream hover:bg-navy/90">
          Close
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-2">
      <div className="space-y-1.5">
        <Label htmlFor="studentName" className="text-navy font-medium">
          Student Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="studentName"
          value={studentName}
          onChange={(e) => setStudentName(e.target.value)}
          placeholder="Full name"
          className={errors.studentName ? 'border-red-400' : ''}
        />
        {errors.studentName && <p className="text-red-500 text-xs">{errors.studentName}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="contactNumber" className="text-navy font-medium">
          Contact Number <span className="text-red-500">*</span>
        </Label>
        <Input
          id="contactNumber"
          value={contactNumber}
          onChange={(e) => setContactNumber(e.target.value)}
          placeholder="Phone number"
          className={errors.contactNumber ? 'border-red-400' : ''}
        />
        {errors.contactNumber && <p className="text-red-500 text-xs">{errors.contactNumber}</p>}
      </div>

      <div className="space-y-1.5">
        <Label className="text-navy font-medium">
          Fee Type <span className="text-red-500">*</span>
        </Label>
        <Select value={feeType} onValueChange={setFeeType}>
          <SelectTrigger className={errors.feeType ? 'border-red-400' : ''}>
            <SelectValue placeholder="Select fee type" />
          </SelectTrigger>
          <SelectContent>
            {FEE_TYPES.map((ft) => (
              <SelectItem key={ft} value={ft}>
                {ft}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.feeType && <p className="text-red-500 text-xs">{errors.feeType}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="amount" className="text-navy font-medium">
          Amount (₹) <span className="text-red-500">*</span>
        </Label>
        <Input
          id="amount"
          type="number"
          value={amountStr}
          onChange={(e) => setAmountStr(e.target.value)}
          placeholder="e.g. 2499"
          min="1"
          className={errors.amount ? 'border-red-400' : ''}
        />
        {errors.amount && <p className="text-red-500 text-xs">{errors.amount}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="durationStart" className="text-navy font-medium">
            From <span className="text-red-500">*</span>
          </Label>
          <Input
            id="durationStart"
            type="date"
            value={durationStart}
            onChange={(e) => setDurationStart(e.target.value)}
            className={errors.durationStart ? 'border-red-400' : ''}
          />
          {errors.durationStart && <p className="text-red-500 text-xs">{errors.durationStart}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="durationEnd" className="text-navy font-medium">
            To <span className="text-red-500">*</span>
          </Label>
          <Input
            id="durationEnd"
            type="date"
            value={durationEnd}
            onChange={(e) => setDurationEnd(e.target.value)}
            className={errors.durationEnd ? 'border-red-400' : ''}
          />
          {errors.durationEnd && <p className="text-red-500 text-xs">{errors.durationEnd}</p>}
        </div>
      </div>

      {addPaymentEnquiry.isError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-600 text-sm">Failed to submit. Please try again.</p>
        </div>
      )}

      <div className="flex gap-3 pt-1">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="flex-1 border-navy/30 text-navy"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={addPaymentEnquiry.isPending}
          className="flex-1 bg-navy text-cream hover:bg-navy/90"
        >
          {addPaymentEnquiry.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit Enquiry'
          )}
        </Button>
      </div>
    </form>
  );
}
