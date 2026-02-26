# Specification

## Summary
**Goal:** Allow admins to attach a Google Meet, Zoho Meet, or Zoom meeting link to any session, and display a "Join Class" button in the student portal for sessions that have a link.

**Planned changes:**
- Extend the session data type to include an optional meeting platform (Google Meet, Zoho Meet, Zoom) and an optional meeting link URL.
- Add backend functions to set, update, and clear the meeting link on an existing session.
- In the Admin Dashboard → Booked Students → add/edit session form, add a platform selector dropdown and a meeting link URL input field (both optional).
- For sessions that already have a meeting link, display the platform name, the link, and Edit/Delete buttons in the admin session list; Edit opens an inline pre-filled form, Delete clears the link after confirmation.
- In the Student Portal sessions view, show a prominent "Join Class" button on each session that has a meeting link; the button opens the URL in a new tab and indicates the platform via icon or label.
- Sessions without a meeting link show no button and are otherwise unaffected.
- Meeting link state in the student portal reflects admin changes in real time.

**User-visible outcome:** Admins can add, edit, or remove a meeting link on any session from the admin dashboard, and students will see a clickable "Join Class" button on their session cards whenever a link has been set.
