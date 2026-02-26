import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { calculateBookingPrice } from '../utils/pricingCalculator';
import { ArrowRight } from 'lucide-react';

const SERVICES = [
  'JEE Mathematics',
  'NEET Mathematics',
  'Board Exam Prep',
  'Foundation Course',
  'Advanced Problem Solving',
  'Crash Course',
];

interface BookingFormProps {
  defaultService?: string;
  onSubmit: (data: any) => void;
}

export default function BookingForm({ defaultService, onSubmit }: BookingFormProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [service, setService] = useState(defaultService ?? '');
  const [classType, setClassType] = useState<'oneOnOne' | 'group'>('oneOnOne');
  const [numberOfClasses, setNumberOfClasses] = useState(1);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  const pricing = service
    ? calculateBookingPrice(service, classType, numberOfClasses)
    : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !service || !date || !time) return;

    onSubmit({
      name,
      phone,
      serviceType: service,
      service,
      classType,
      numberOfClasses,
      date,
      time,
      discountPercent: pricing?.discountPercent ?? 0,
      finalAmount: pricing?.finalAmount ?? 0,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Full Name</Label>
        <Input
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="mt-1"
        />
      </div>

      <div>
        <Label>Phone Number</Label>
        <Input
          placeholder="+91 XXXXX XXXXX"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          className="mt-1"
        />
      </div>

      <div>
        <Label>Service</Label>
        <Select value={service} onValueChange={setService}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select a service" />
          </SelectTrigger>
          <SelectContent>
            {SERVICES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Class Type</Label>
        <Select value={classType} onValueChange={(v) => setClassType(v as 'oneOnOne' | 'group')}>
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="oneOnOne">1-on-1</SelectItem>
            <SelectItem value="group">Group</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Number of Classes</Label>
        <Input
          type="number"
          min={1}
          max={50}
          value={numberOfClasses}
          onChange={(e) => setNumberOfClasses(parseInt(e.target.value) || 1)}
          className="mt-1"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Date</Label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="mt-1"
          />
        </div>
        <div>
          <Label>Time</Label>
          <Input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
            className="mt-1"
          />
        </div>
      </div>

      {pricing && (
        <div className="bg-muted/30 rounded-lg p-3 space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Price per class:</span>
            <span>₹{pricing.pricePerClass}</span>
          </div>
          {pricing.discountPercent > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount ({pricing.discountPercent}%):</span>
              <span>-₹{pricing.totalAmount - pricing.finalAmount}</span>
            </div>
          )}
          <div className="flex justify-between font-semibold border-t border-border pt-1 mt-1">
            <span>Total:</span>
            <span>₹{pricing.finalAmount}</span>
          </div>
        </div>
      )}

      <Button
        type="submit"
        className="w-full bg-[oklch(0.75_0.15_85)] text-[oklch(0.2_0.05_240)] hover:bg-[oklch(0.7_0.15_85)] font-semibold gap-2"
        disabled={!name || !phone || !service || !date || !time}
      >
        Continue to Payment
        <ArrowRight className="w-4 h-4" />
      </Button>
    </form>
  );
}
