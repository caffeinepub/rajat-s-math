# Specification

## Summary
**Goal:** Add two new discount codes (RAJAT50 and MATHS30) to the booking payment flow and admin panel.

**Planned changes:**
- Add `RAJAT50` (50% discount) to the discount code validation logic in `UpiPaymentStep.tsx`
- Add `MATHS30` (30% discount) to the discount code validation logic in `UpiPaymentStep.tsx`
- Update the `DiscountCodeManager` admin UI to display all four active codes: `SAVE10`, `SUMMER20`, `RAJAT50`, and `MATHS30`

**User-visible outcome:** Users can apply `RAJAT50` for 50% off or `MATHS30` for 30% off during checkout, and admins can see all four active discount codes listed in the admin panel.
