# Specification

## Summary
**Goal:** Add attendance tracking, discount code generation, and unpurchased visitor tracking features to Rajat's Equation platform.

**Planned changes:**
- Add an Attendance data model (stable storage) storing session date, course/booking reference, and present/absent status per student
- Expose backend queries for attendance filterable by date range, returning total sessions, attended count, and attendance rate
- Add an Attendance section to the Admin Dashboard: select student, pick date range, toggle present/absent per session, view summary stats
- Add an Attendance tab to the Student Portal showing the logged-in student's own attendance with date-range filter and summary stats
- Add a DiscountCode data model (stable storage) with fields: code, percentage, isActive, isUsed, usedByPrincipal
- Add admin backend functions to generate, list, and deactivate single-use percentage-based discount codes
- Add a backend function to validate and apply a discount code at checkout, marking it used upon successful purchase
- Add a Discount Codes section to the Admin Dashboard: generate codes with a percentage input, view all codes with status, deactivate active codes
- Integrate a discount code input field into the booking/checkout flow that validates and applies the discount to the displayed total
- Add a VisitorActivity data model (stable storage) recording login and course-view events for authenticated unpurchased users
- Log a login event when an authenticated user accesses the platform and a course-view event when they view an unpurchased course (silent, no UI feedback)
- Add an Unpurchased Visitor Tracking section to the Admin Dashboard showing a table of tracked users with login history and viewed courses

**User-visible outcome:** Admins can manually track student attendance per session, generate and manage single-use discount codes, and review which logged-in users have browsed courses without purchasing. Students can view their own attendance records with date filtering. Users can apply discount codes at checkout to reduce the displayed price.
