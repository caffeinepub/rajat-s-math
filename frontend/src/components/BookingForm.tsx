import { useState, useEffect } from 'react';
import { User, Phone, Calendar, Clock, BookOpen, Loader2, Users, UserCheck, Tag, Hash } from 'lucide-react';
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
import { ClassType } from '../backend';
import { calculateBookingPrice, getPricePerClass, DISCOUNT_TIERS } from '../utils/pricingCalculator';

export const SERVICE_OPTIONS = [
  { value: 'Class 10 Boards Full Prep', label: 'Class 10 Boards Full Prep' },
  { value: 'Class 12 Boards Full Prep', label: 'Class 12 Boards Full Prep' },
  { value: 'JEE Foundation', label: 'JEE Foundation' },
  { value: 'JEE Full Course Prep', label: 'JEE Full Course Prep' },
  { value: 'IOQM / NMTC / Other Olympiads Prep', label: 'IOQM / NMTC / Olympiads Prep' },
  { value: 'How to Think in Math', label: 'How to Think in Math (3-Month Course)' },
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

interface FormErrors {
  name?: string;
  phone?: string;
  date?: string;
  time?: string;
  serviceType?: string;
  classType?: string;
  numberOfClasses?: string;
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
  const [classType, setClassType] = useState<ClassType | ''>('');
  const [numberOfClassesStr, setNumberOfClassesStr] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  const numberOfClasses = parseInt(numberOfClassesStr, 10);
  const validNumberOfClasses = !isNaN(numberOfClasses) && numberOfClasses >= 1;

  const pricing =
    serviceType && classType && validNumberOfClasses
      ? calculateBookingPrice(serviceType, classType as ClassType, numberOfClasses)
      : null;

  const pricePerClassPreview =
    serviceType && classType
      ? getPricePerClass(serviceType, classType as ClassType)
      : null;

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Enter a valid 10-digit Indian mobile number';
    }
    if (!date) newErrors.date = 'Date is required';
    if (!time) newErrors.time = 'Time is required';
    if (!serviceType) newErrors.serviceType = 'Please select a service';
    if (!classType) newErrors.classType = 'Please select a class type';
    if (!numberOfClassesStr) {
      newErrors.numberOfClasses = 'Number of classes is required';
    } else if (!validNumberOfClasses) {
      newErrors.numberOfClasses = 'Please enter a valid number (minimum 1)';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (!pricing || !classType) return;
    onSubmit({
      name: name.trim(),
      phone: phone.trim(),
      date,
      time,
      serviceType,
      classType: classType as ClassType,
      numberOfClasses,
      discountPercent: pricing.discountPercent,
      finalAmount: pricing.finalAmount,
    });
  };

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
          onValueChange={(val) => {
            setServiceType(val);
            setErrors((p) => ({ ...p, serviceType: undefined }));
          }}
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

      {/* Class Type Selection */}
      <div className="space-y-2">
        <Label className="text-navy font-semibold flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5" /> Class Type
        </Label>
        <div className="grid grid-cols-2 gap-3">
          {/* One-on-One */}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => {
              setClassType(ClassType.oneOnOne);
              setErrors((p) => ({ ...p, classType: undefined }));
            }}
            className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all cursor-pointer text-left
              ${classType === ClassType.oneOnOne
                ? 'border-gold bg-amber-50 shadow-md'
                : 'border-border-warm bg-white hover:border-navy/40 hover:bg-slate-50'
              }
              ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {classType === ClassType.oneOnOne && (
              <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-gold flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-white" />
              </span>
            )}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${classType === ClassType.oneOnOne ? 'bg-amber-100' : 'bg-slate-100'}`}>
              <UserCheck className={`w-5 h-5 ${classType === ClassType.oneOnOne ? 'text-gold-dark' : 'text-slate-500'}`} />
            </div>
            <div className="text-center">
              <p className="font-bold text-navy text-sm">One-on-One</p>
              {serviceType ? (
                <p className="text-xs text-gold-dark font-semibold mt-0.5">
                  ₹{getPricePerClass(serviceType, ClassType.oneOnOne).toLocaleString('en-IN')}/class
                </p>
              ) : (
                <p className="text-xs text-slate-500 mt-0.5">Personal sessions</p>
              )}
            </div>
          </button>

          {/* Group */}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => {
              setClassType(ClassType.group);
              setErrors((p) => ({ ...p, classType: undefined }));
            }}
            className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all cursor-pointer text-left
              ${classType === ClassType.group
                ? 'border-navy bg-slate-100 shadow-md'
                : 'border-border-warm bg-white hover:border-navy/40 hover:bg-slate-50'
              }
              ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {classType === ClassType.group && (
              <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-navy flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-white" />
              </span>
            )}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${classType === ClassType.group ? 'bg-navy/20' : 'bg-slate-100'}`}>
              <Users className={`w-5 h-5 ${classType === ClassType.group ? 'text-navy' : 'text-slate-500'}`} />
            </div>
            <div className="text-center">
              <p className="font-bold text-navy text-sm">Group Classes</p>
              {serviceType ? (
                <p className="text-xs text-navy font-semibold mt-0.5">
                  ₹{getPricePerClass(serviceType, ClassType.group).toLocaleString('en-IN')}/class
                </p>
              ) : (
                <p className="text-xs text-slate-500 mt-0.5">Shared sessions</p>
              )}
            </div>
          </button>
        </div>
        {errors.classType && <p className="text-red-500 text-xs">{errors.classType}</p>}
      </div>

      {/* Number of Classes */}
      <div className="space-y-1.5">
        <Label htmlFor="booking-classes" className="text-navy font-semibold flex items-center gap-1.5">
          <Hash className="w-3.5 h-3.5" /> Number of Classes
        </Label>
        <Input
          id="booking-classes"
          type="number"
          min={1}
          placeholder="Enter number of classes (e.g. 10)"
          value={numberOfClassesStr}
          onChange={(e) => {
            setNumberOfClassesStr(e.target.value);
            setErrors((p) => ({ ...p, numberOfClasses: undefined }));
          }}
          disabled={isSubmitting || !classType}
          className={`border-border-warm focus:border-navy ${errors.numberOfClasses ? 'border-red-500' : ''} ${!classType ? 'opacity-50' : ''}`}
        />
        {!classType && (
          <p className="text-xs text-slate-500">Select a class type first</p>
        )}
        {errors.numberOfClasses && <p className="text-red-500 text-xs">{errors.numberOfClasses}</p>}

        {/* Discount hint */}
        {classType && (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {DISCOUNT_TIERS.map((tier) => (
              <span
                key={tier.minClasses}
                className={`text-xs px-2 py-0.5 rounded-full border font-medium transition-colors ${
                  validNumberOfClasses && numberOfClasses >= tier.minClasses
                    ? 'bg-green-100 text-green-700 border-green-300'
                    : 'bg-slate-100 text-slate-500 border-slate-200'
                }`}
              >
                <Tag className="w-2.5 h-2.5 inline mr-0.5" />
                {tier.label}
              </span>
            ))}
          </div>
        )}
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

      {/* Pricing Breakdown */}
      {pricing ? (
        <div className="rounded-xl border-2 border-navy/20 bg-slate-50 overflow-hidden">
          <div className="bg-navy px-4 py-2 border-b border-navy/15">
            <p className="text-xs font-bold text-cream uppercase tracking-wide">Pricing Summary</p>
          </div>
          <div className="px-4 py-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-warm-text">Price per class</span>
              <span className="font-semibold text-navy">₹{pricing.pricePerClass.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-warm-text">Number of classes</span>
              <span className="font-semibold text-navy">× {pricing.numberOfClasses}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-warm-text">Base amount</span>
              <span className="font-semibold text-navy">₹{pricing.baseAmount.toLocaleString('en-IN')}</span>
            </div>
            {pricing.discountPercent > 0 && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-green-700 font-medium flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    Discount ({pricing.discountPercent}% off)
                  </span>
                  <span className="font-semibold text-green-700">− ₹{pricing.discountAmount.toLocaleString('en-IN')}</span>
                </div>
              </>
            )}
            <div className="border-t border-navy/20 pt-2 flex justify-between items-center">
              <span className="font-bold text-navy">Total Amount</span>
              <span className="text-xl font-bold text-gold-dark">₹{pricing.finalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      ) : (
        pricePerClassPreview && (
          <div className="rounded-lg bg-slate-50 border border-navy/20 px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-navy font-medium">Price per class</span>
            <span className="text-lg font-bold text-gold-dark">
              ₹{pricePerClassPreview.toLocaleString('en-IN')}/class
            </span>
          </div>
        )
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
