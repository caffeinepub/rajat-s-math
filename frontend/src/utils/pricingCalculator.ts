export type ClassTypeKey = 'oneOnOne' | 'group';

export const PRICE_PER_CLASS_ONE_ON_ONE: Record<string, number> = {
  'JEE Mathematics': 800,
  'NEET Mathematics': 700,
  'Board Exam Prep': 600,
  'Foundation Course': 500,
  'Advanced Problem Solving': 900,
  'Crash Course': 750,
};

export const PRICE_PER_CLASS_GROUP: Record<string, number> = {
  'JEE Mathematics': 400,
  'NEET Mathematics': 350,
  'Board Exam Prep': 300,
  'Foundation Course': 250,
  'Advanced Problem Solving': 450,
  'Crash Course': 375,
};

export const DISCOUNT_TIERS = [
  { minClasses: 20, discount: 35 },
  { minClasses: 15, discount: 30 },
  { minClasses: 10, discount: 20 },
];

export function getPricePerClass(serviceType: string, classType: ClassTypeKey): number {
  if (classType === 'group') {
    return PRICE_PER_CLASS_GROUP[serviceType] ?? 500;
  }
  return PRICE_PER_CLASS_ONE_ON_ONE[serviceType] ?? 800;
}

export function getDiscountPercent(numberOfClasses: number): number {
  for (const tier of DISCOUNT_TIERS) {
    if (numberOfClasses >= tier.minClasses) {
      return tier.discount;
    }
  }
  return 0;
}

export function calculateBookingPrice(
  serviceType: string,
  classType: ClassTypeKey,
  numberOfClasses: number
): { pricePerClass: number; discountPercent: number; totalAmount: number; finalAmount: number } {
  const pricePerClass = getPricePerClass(serviceType, classType);
  const discountPercent = getDiscountPercent(numberOfClasses);
  const totalAmount = pricePerClass * numberOfClasses;
  const finalAmount = Math.round(totalAmount * (1 - discountPercent / 100));
  return { pricePerClass, discountPercent, totalAmount, finalAmount };
}
