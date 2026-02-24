import { ClassType } from '../backend';

export interface PricingResult {
  pricePerClass: number;
  numberOfClasses: number;
  baseAmount: number;
  discountPercent: number;
  discountAmount: number;
  finalAmount: number;
}

// Per-class prices by service and class type (in ₹)
export const SERVICE_PRICES: Record<string, { oneOnOne: number; group: number }> = {
  'Class 10 Boards Full Prep': { oneOnOne: 350, group: 250 },
  'Class 12 Boards Full Prep': { oneOnOne: 400, group: 300 },
  'JEE Foundation': { oneOnOne: 450, group: 350 },
  'JEE Full Course Prep': { oneOnOne: 500, group: 400 },
  'IOQM / NMTC / Other Olympiads Prep': { oneOnOne: 500, group: 400 },
  'How to Think in Math': { oneOnOne: 300, group: 250 },
};

export const DEFAULT_PRICES = { oneOnOne: 500, group: 400 };

export function getPricePerClass(service: string, classType: ClassType): number {
  const prices = SERVICE_PRICES[service] ?? DEFAULT_PRICES;
  return classType === ClassType.oneOnOne ? prices.oneOnOne : prices.group;
}

export function getDiscountPercent(numberOfClasses: number): number {
  if (numberOfClasses >= 20) return 35;
  if (numberOfClasses >= 15) return 30;
  if (numberOfClasses >= 10) return 20;
  return 0;
}

export function calculateBookingPrice(
  service: string,
  classType: ClassType,
  numberOfClasses: number
): PricingResult {
  const pricePerClass = getPricePerClass(service, classType);
  const baseAmount = pricePerClass * numberOfClasses;
  const discountPercent = getDiscountPercent(numberOfClasses);
  const discountAmount = Math.round((baseAmount * discountPercent) / 100);
  const finalAmount = baseAmount - discountAmount;

  return {
    pricePerClass,
    numberOfClasses,
    baseAmount,
    discountPercent,
    discountAmount,
    finalAmount,
  };
}

export const DISCOUNT_TIERS = [
  { minClasses: 20, percent: 35, label: '20+ classes → 35% off' },
  { minClasses: 15, percent: 30, label: '15–19 classes → 30% off' },
  { minClasses: 10, percent: 20, label: '10–14 classes → 20% off' },
];
