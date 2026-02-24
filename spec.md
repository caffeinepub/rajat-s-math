# Specification

## Summary
**Goal:** Add Login/Logout buttons to the navigation bar and fix admin dashboard access so that only the principal associated with rkj.jain2204@gmail.com can view and access the admin dashboard.

**Planned changes:**
- Add a Login button to the navigation bar (visible on all pages) when no user is authenticated, using Internet Identity.
- Add a Logout button to the navigation bar when a user is authenticated; on logout, clear React Query cache and redirect to home page.
- After login, automatically redirect admin (rkj.jain2204@gmail.com principal) to the admin dashboard (#admin) and all other users to the home page.
- Hide the admin dashboard link/button from navigation and hero section for all non-admin users.
- Redirect any non-admin user who attempts to navigate directly to #admin back to the home page.
- Fix the admin dashboard not rendering/appearing for the admin user.
- Ensure the backend's isAdmin check correctly identifies and returns true only for the principal associated with rkj.jain2204@gmail.com.

**User-visible outcome:** The navigation bar shows Login/Logout controls on every page. After logging in, the admin is automatically taken to the admin dashboard (which is now fully visible and functional), while all other users go to the home page. Non-admin users have no access to or visibility of the admin dashboard.
