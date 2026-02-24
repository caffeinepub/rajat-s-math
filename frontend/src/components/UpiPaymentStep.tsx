import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { UPI_ID, isMobileDevice } from '../utils/upiPayment';
import { useValidateDiscountCode } from '../hooks/useQueries';
import { Tag, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface UpiPaymentStepProps {
  amount: number;
  bookingName: string;
  service: string;
  classType: 'oneOnOne' | 'group';
  numberOfClasses: number;
  onConfirm: (discountPercent: number, finalAmount: number) => void;
  onBack: () => void;
}

export default function UpiPaymentStep({
  amount,
  bookingName,
  service,
  classType,
  numberOfClasses,
  onConfirm,
  onBack,
}: UpiPaymentStepProps) {
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [discountError, setDiscountError] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);

  const validateDiscount = useValidateDiscountCode();

  const discountedAmount =
    appliedDiscount > 0 ? Math.round(amount * (1 - appliedDiscount / 100)) : amount;

  const transactionNote = `Booking: ${service} - ${bookingName}`;
  const encodedNote = encodeURIComponent(transactionNote);
  const upiUrl = `upi://pay?pa=${UPI_ID}&pn=Rajat%20Equation&am=${discountedAmount.toFixed(2)}&cu=INR&tn=${encodedNote}`;
  const isMobile = isMobileDevice();

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
      setDiscountError('Please enter a discount code');
      return;
    }
    setDiscountError('');
    try {
      const percent = await validateDiscount.mutateAsync(discountCode.trim());
      const percentNum = Number(percent);
      setAppliedDiscount(percentNum);
      setDiscountApplied(true);
      toast.success(`Discount applied: ${percentNum}% off!`);
    } catch (err: any) {
      setDiscountError(err.message ?? 'Invalid or already used code');
      setAppliedDiscount(0);
      setDiscountApplied(false);
    }
  };

  const handleRemoveDiscount = () => {
    setDiscountCode('');
    setAppliedDiscount(0);
    setDiscountApplied(false);
    setDiscountError('');
  };

  return (
    <div className="space-y-5">
      {/* Booking Summary */}
      <Card className="border-border-warm bg-warm-light/30">
        <CardContent className="pt-4 pb-3 space-y-2">
          <h3 className="text-sm font-semibold text-navy">Booking Summary</h3>
          <div className="space-y-1 text-sm text-warm-text">
            <div className="flex justify-between">
              <span>Student</span>
              <span className="text-navy font-medium">{bookingName}</span>
            </div>
            <div className="flex justify-between">
              <span>Service</span>
              <span className="text-navy font-medium">{service}</span>
            </div>
            <div className="flex justify-between">
              <span>Class Type</span>
              <span className="text-navy font-medium">
                {classType === 'oneOnOne' ? '1-on-1' : 'Group'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Classes</span>
              <span className="text-navy font-medium">{numberOfClasses}</span>
            </div>
            <div className="flex justify-between border-t border-border-warm pt-1 mt-1">
              <span>Base Amount</span>
              <span className="text-navy font-medium">₹{amount}</span>
            </div>
            {appliedDiscount > 0 && (
              <>
                <div className="flex justify-between text-green-600">
                  <span>Discount ({appliedDiscount}%)</span>
                  <span>-₹{amount - discountedAmount}</span>
                </div>
                <div className="flex justify-between font-bold text-navy border-t border-border-warm pt-1">
                  <span>Final Amount</span>
                  <span>₹{discountedAmount}</span>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Discount Code */}
      <div className="space-y-2">
        <Label className="text-warm-text text-sm font-medium flex items-center gap-1">
          <Tag className="w-3 h-3" /> Discount Code (Optional)
        </Label>
        {discountApplied ? (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-700">
                Code "{discountCode}" applied — {appliedDiscount}% off!
              </p>
              <p className="text-xs text-green-600">You save ₹{amount - discountedAmount}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemoveDiscount}
              className="text-red-500 hover:text-red-700 text-xs"
            >
              Remove
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Input
              value={discountCode}
              onChange={(e) => {
                setDiscountCode(e.target.value);
                setDiscountError('');
              }}
              placeholder="Enter discount code..."
              className="border-border-warm flex-1"
              onKeyDown={(e) => e.key === 'Enter' && handleApplyDiscount()}
            />
            <Button
              onClick={handleApplyDiscount}
              disabled={validateDiscount.isPending}
              variant="outline"
              className="border-gold text-gold hover:bg-gold/10 whitespace-nowrap"
            >
              {validateDiscount.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Apply'
              )}
            </Button>
          </div>
        )}
        {discountError && (
          <p className="text-xs text-red-500 flex items-center gap-1">
            <XCircle className="w-3 h-3" /> {discountError}
          </p>
        )}
      </div>

      {/* Payment Amount */}
      <div className="text-center py-4 bg-navy/5 rounded-xl border border-navy/10">
        <p className="text-sm text-warm-text mb-1">Amount to Pay</p>
        <p className="text-4xl font-bold text-navy">₹{discountedAmount}</p>
        {appliedDiscount > 0 && (
          <Badge className="mt-2 bg-green-100 text-green-700 border-green-200" variant="outline">
            {appliedDiscount}% discount applied
          </Badge>
        )}
      </div>

      {/* UPI Payment Options */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-navy text-center">Pay via UPI</p>
        {isMobile ? (
          <a href={upiUrl} className="block">
            <Button className="w-full bg-navy text-cream hover:bg-navy/90 h-12 text-base">
              Open UPI App to Pay ₹{discountedAmount}
            </Button>
          </a>
        ) : (
          <div className="text-center space-y-2">
            <p className="text-sm text-warm-text">Scan QR or use UPI ID:</p>
            <p className="font-mono text-navy font-semibold text-lg">{UPI_ID}</p>
            <p className="text-xs text-warm-text">Use any UPI app (GPay, PhonePe, Paytm, etc.)</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={onBack} className="flex-1 border-border-warm">
          Back
        </Button>
        <Button
          onClick={() => onConfirm(appliedDiscount, discountedAmount)}
          className="flex-1 bg-gold text-navy hover:bg-gold/90 font-semibold"
        >
          I've Paid ₹{discountedAmount} ✓
        </Button>
      </div>
    </div>
  );
}
