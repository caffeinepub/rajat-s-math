# Specification

## Summary
**Goal:** Add a booking status lifecycle (pending → awaitingPayment → completed), an admin dashboard for marking bookings as paid, and a public "Completed Sessions" page for Rajat's Equation tutoring app.

**Planned changes:**
- Extend backend booking records with a `status` field (`#pending`, `#awaitingPayment`, `#completed`) and an optional `paymentConfirmedAt` timestamp
- Add admin-only `markAsPaid(bookingId)` backend function that transitions a booking from `#awaitingPayment` to `#completed` and records the timestamp
- Add public `getCompletedBookings()` backend query returning all completed bookings (no auth required)
- Update booking submission flow so bookings submitted after the UPI payment step are saved with `#awaitingPayment` status; confirmation screen shows "Awaiting Payment Confirmation" messaging
- Create a protected Admin Dashboard page (admin principal only) listing all bookings grouped by status, with a "Mark as Paid" button on each `#awaitingPayment` booking
- Create a public "Completed Sessions" page showing completed booking cards (name, service, date, "Completed ✓" badge) with empty state handling
- Add a navigation link to the Completed Sessions page visible to all users, and an Admin link visible only when the admin is authenticated

**User-visible outcome:** Admin can log in, view all bookings by status, and mark awaiting-payment bookings as paid. Any visitor can browse the public Completed Sessions page. Students/parents see an "Awaiting Payment Confirmation" message after submitting a booking with payment.
