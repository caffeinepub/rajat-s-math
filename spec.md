# Specification

## Summary
**Goal:** Connect admin-generated discount codes to the payment/booking form and make all dropdown menus fully opaque across the portal.

**Planned changes:**
- Add a discount code input field to the UpiPaymentStep / BookingFlowManager form
- On code entry, call the backend validation endpoint and display the discounted price in real-time
- Show clear error messages for invalid or expired codes
- Include the discount code and final discounted price in the booking form submission payload
- Display the applied discount code and discounted amount on the BookingConfirmation screen
- Remove all transparency, glassmorphism, and backdrop-blur effects from every dropdown menu across the portal (student portal, admin dashboard, booking forms, service selections, etc.) and replace with solid, opaque backgrounds using the app's navy/cream/gold design tokens

**User-visible outcome:** Users can apply admin-generated discount codes at checkout and see the reduced price before submitting. All dropdown menus throughout the portal now display with solid, fully opaque backgrounds.
