import { useState } from 'react';
import { User, Phone, Calendar, Clock, BookOpen, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import type { BookingFormData } from '../types/booking';

export const SERVICE_OPTIONS = [
  { value: 'Class 10 Boards Full Prep', label: 'Class 10 Boards Full Prep', price: 350 },
  { value: 'Class 12 Boards Full Prep', label: 'Class 12 Boards Full Prep', price: 400 },
  { value: 'JEE Foundation', label: 'JEE Foundation', price: 450 },
  { value: 'JEE Full Course Prep', label: 'JEE Full Course Prep', price: 500 },
  { value: 'IOQM / NMTC / Other Olympiads Prep', label: 'IOQM / NMTC / Olympiads Prep', price: 500 },
  { value: 'How to Think in Math', label: 'How to Think in Math (3-Month Course)', price: 1999 },
];

interface BookingFormProps {
  open?: boolean;
  onClose: () => void;
  onSubmit: (data: BookingFormData) => void;
  preSelectedService?: string;
  isSubmitting?: boolean;
  /** When true, renders the form fields directly without a wrapping Dialog */
  inline?: boolean;
}

export function BookingForm({
  onClose,
  onSubmit,
  preSelectedService,
  isSubmitting = false,
  inline = false,
}: BookingFormProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [serviceType, setServiceType] = useState(preSelectedService ?? '');
  const [errors, setErrors] = useState<Partial<BookingFormData>>({});

  const validate = (): boolean => {
    const newErrors: Partial<BookingFormData> = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Enter a valid 10-digit Indian mobile number';
    }
    if (!date) newErrors.date = 'Date is required';
    if (!time) newErrors.time = 'Time is required';
    if (!serviceType) newErrors.serviceType = 'Please select a service';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({ name: name.trim(), phone: phone.trim(), date, time, serviceType });
  };

  const selectedService = SERVICE_OPTIONS.find((s) => s.value === serviceType);
  const today = new Date().toISOString().split('T')[0];

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4 mt-2">
      {/* Name */}
      <div className="space-y-1.5">
        <Label htmlFor="booking-name" className="text-navy font-semibold flex items-center gap-1.5">
          <User className="w-3.5 h-3.5" /> Full Name
        </Label>
        <Input
          id="booking-name"
          type="text"
          placeholder="Enter your full name"
          value={name}
          onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: undefined })); }}
          disabled={isSubmitting}
          className={`border-border-warm focus:border-navy ${errors.name ? 'border-red-500' : ''}`}
        />
        {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
      </div>

      {/* Phone */}
      <div className="space-y-1.5">
        <Label htmlFor="booking-phone" className="text-navy font-semibold flex items-center gap-1.5">
          <Phone className="w-3.5 h-3.5" /> Mobile Number
        </Label>
        <Input
          id="booking-phone"
          type="tel"
          placeholder="10-digit mobile number (e.g. 9876543210)"
          value={phone}
          onChange={(e) => { setPhone(e.target.value); setErrors((p) => ({ ...p, phone: undefined })); }}
          disabled={isSubmitting}
          maxLength={10}
          className={`border-border-warm focus:border-navy ${errors.phone ? 'border-red-500' : ''}`}
        />
        {errors.phone && <p className="text-red-500 text-xs">{errors.phone}</p>}
      </div>

      {/* Service */}
      <div className="space-y-1.5">
        <Label className="text-navy font-semibold flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5" /> Select Service
        </Label>
        <Select
          value={serviceType}
          onValueChange={(val) => { setServiceType(val); setErrors((p) => ({ ...p, serviceType: undefined })); }}
          disabled={isSubmitting}
        >
          <SelectTrigger className={`border-border-warm ${errors.serviceType ? 'border-red-500' : ''}`}>
            <SelectValue placeholder="Choose a course / service" />
          </SelectTrigger>
          <SelectContent>
            {SERVICE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.serviceType && <p className="text-red-500 text-xs">{errors.serviceType}</p>}
      </div>

      {/* Date & Time */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="booking-date" className="text-navy font-semibold flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" /> Preferred Date
          </Label>
          <Input
            id="booking-date"
            type="date"
            min={today}
            value={date}
            onChange={(e) => { setDate(e.target.value); setErrors((p) => ({ ...p, date: undefined })); }}
            disabled={isSubmitting}
            className={`border-border-warm focus:border-navy ${errors.date ? 'border-red-500' : ''}`}
          />
          {errors.date && <p className="text-red-500 text-xs">{errors.date}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="booking-time" className="text-navy font-semibold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Preferred Time
          </Label>
          <Input
            id="booking-time"
            type="time"
            value={time}
            onChange={(e) => { setTime(e.target.value); setErrors((p) => ({ ...p, time: undefined })); }}
            disabled={isSubmitting}
            className={`border-border-warm focus:border-navy ${errors.time ? 'border-red-500' : ''}`}
          />
          {errors.time && <p className="text-red-500 text-xs">{errors.time}</p>}
        </div>
      </div>

      {/* Price preview */}
      {selectedService && (
        <div className="rounded-lg bg-navy/5 border border-navy/20 px-4 py-3 flex items-center justify-between">
          <span className="text-sm text-navy font-medium">Session Fee</span>
          <span className="text-lg font-bold text-gold-dark">
            ₹{selectedService.price.toLocaleString('en-IN')}
            {selectedService.value !== 'How to Think in Math' ? '/hour' : ' (3 months)'}
          </span>
        </div>
      )}

      <div className="flex gap-3 mt-2">
        <Button
          type="button"
          variant="ghost"
          onClick={onClose}
          disabled={isSubmitting}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-navy hover:bg-navy/90 text-white font-bold py-6 text-base shadow-lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing…
            </>
          ) : (
            'Proceed to Payment →'
          )}
        </Button>
      </div>
    </form>
  );

  if (inline) {
    return formContent;
  }

  // Standalone usage: wrap in a simple container (no Dialog, caller manages the Dialog)
  return (
    <div className="px-1">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-navy flex items-center justify-center flex-shrink-0">
          <BookOpen className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-xl font-bold text-navy font-serif">Book a Session</p>
          <p className="text-warm-text text-sm">Fill in your details to proceed to payment</p>
        </div>
      </div>
      {formContent}
    </div>
  );
}
