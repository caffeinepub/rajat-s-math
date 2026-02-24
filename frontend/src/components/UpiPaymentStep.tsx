import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { UPI_ID } from '../utils/upiPayment';
import { Tag, CheckCircle, XCircle, Loader2, Smartphone, Monitor, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface UpiPaymentStepProps {
  amount: number;
  bookingName: string;
  service: string;
  classType: 'oneOnOne' | 'group';
  numberOfClasses: number;
  onConfirm: (discountPercent: number, finalAmount: number, discountCode?: string) => void;
  onBack: () => void;
}

// Hardcoded valid discount codes (case-insensitive)
const VALID_DISCOUNT_CODES: Record<string, number> = {
  SAVE10: 10,
  SUMMER20: 20,
  RAJAT50: 50,
  MATHS30: 30,
};

function isMobileDevice(): boolean {
  return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function generateQrCodeUrl(upiUrl: string, size: number = 250): string {
  const encoded = encodeURIComponent(upiUrl);
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}&bgcolor=ffffff&color=1a2744&margin=10`;
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
  const [appliedCode, setAppliedCode] = useState<string>('');
  const [discountError, setDiscountError] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);
  const [copiedUpiId, setCopiedUpiId] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  const isMobile = isMobileDevice();

  const discountedAmount =
    appliedDiscount > 0 ? Math.round(amount * (1 - appliedDiscount / 100)) : amount;

  const transactionNote = `Booking: ${service} - ${bookingName}`;
  const upiUrl = `upi://pay?pa=${UPI_ID}&pn=Rajat%20Equation&am=${discountedAmount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;
  const qrCodeUrl = generateQrCodeUrl(upiUrl, 260);

  const handleApplyDiscount = async () => {
    const trimmedCode = discountCode.trim();
    if (!trimmedCode) {
      setDiscountError('Please enter a discount code');
      return;
    }

    setDiscountError('');
    setIsApplying(true);

    // Small delay for UX feedback
    await new Promise((resolve) => setTimeout(resolve, 300));

    const upperCode = trimmedCode.toUpperCase();
    const discountPercent = VALID_DISCOUNT_CODES[upperCode];

    if (discountPercent !== undefined) {
      setAppliedDiscount(discountPercent);
      setAppliedCode(upperCode);
      setDiscountApplied(true);
      toast.success(`Discount applied: ${discountPercent}% off!`);
    } else {
      setDiscountError('Invalid discount code');
      setAppliedDiscount(0);
      setAppliedCode('');
      setDiscountApplied(false);
    }

    setIsApplying(false);
  };

  const handleRemoveDiscount = () => {
    setDiscountCode('');
    setAppliedDiscount(0);
    setAppliedCode('');
    setDiscountApplied(false);
    setDiscountError('');
  };

  const handleCopyUpiId = async () => {
    try {
      await navigator.clipboard.writeText(UPI_ID);
      setCopiedUpiId(true);
      toast.success('UPI ID copied!');
      setTimeout(() => setCopiedUpiId(false), 2000);
    } catch {
      toast.error('Could not copy UPI ID');
    }
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
                Code &quot;{appliedCode}&quot; applied — {appliedDiscount}% off!
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
              disabled={isApplying || !discountCode.trim()}
              variant="outline"
              className="border-gold text-gold hover:bg-gold/10 whitespace-nowrap"
            >
              {isApplying ? (
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

      {/* UPI Payment Section */}
      <div className="space-y-4">
        <p className="text-sm font-semibold text-navy text-center">Pay via UPI</p>

        {/* QR Code — always visible for all users */}
        <div className="flex flex-col items-center gap-3 p-4 bg-white border-2 border-navy/10 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 text-xs text-warm-text font-medium">
            <Monitor className="w-3.5 h-3.5" />
            <span>Scan QR Code with any UPI app</span>
          </div>
          <div className="p-2 bg-white rounded-xl border border-border-warm shadow-inner">
            <img
              src={qrCodeUrl}
              alt="UPI Payment QR Code"
              width={260}
              height={260}
              className="block rounded-lg"
              style={{ minWidth: 220, minHeight: 220 }}
            />
          </div>
          <div className="text-center space-y-1">
            <p className="text-xs text-warm-text">UPI ID</p>
            <div className="flex items-center gap-2 justify-center">
              <span className="font-mono text-navy font-semibold text-base">{UPI_ID}</span>
              <button
                onClick={handleCopyUpiId}
                className="p-1 rounded hover:bg-navy/10 transition-colors"
                title="Copy UPI ID"
              >
                {copiedUpiId ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4 text-warm-text" />
                )}
              </button>
            </div>
            <p className="text-xs text-warm-text">GPay · PhonePe · Paytm · Any UPI App</p>
          </div>
        </div>

        {/* Mobile deep-link button — only on mobile */}
        {isMobile && (
          <a href={upiUrl} className="block">
            <Button className="w-full bg-navy text-cream hover:bg-navy/90 h-12 text-base flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              Open UPI App to Pay ₹{discountedAmount}
            </Button>
          </a>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={onBack} className="flex-1 border-border-warm">
          Back
        </Button>
        <Button
          onClick={() => onConfirm(appliedDiscount, discountedAmount, appliedCode || undefined)}
          className="flex-1 bg-gold text-navy hover:bg-gold/90 font-semibold"
        >
          I've Paid ₹{discountedAmount} ✓
        </Button>
      </div>
    </div>
  );
}
