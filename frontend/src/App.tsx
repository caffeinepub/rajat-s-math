import React, { useEffect, useRef } from 'react';
import { Hero } from './components/Hero';
import { Services } from './components/Services';
import { EnrollmentCTA } from './components/EnrollmentCTA';
import { Footer } from './components/Footer';
import { LoginButton } from './components/LoginButton';
import { ProfileSetup } from './components/ProfileSetup';
import { CompletedSessions } from './components/CompletedSessions';
import AdminDashboard from './components/AdminDashboard';
import StudentPortal from './components/StudentPortal';
import { useGetCallerUserProfile, useTrackVisitorActivity } from './hooks/useQueries';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { EventType } from './backend';
import { Toaster } from '@/components/ui/sonner';

function getRoute(): string {
  return window.location.hash.replace('#', '') || '/';
}

export default function App() {
  const [route, setRoute] = React.useState(getRoute);
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const trackActivity = useTrackVisitorActivity();
  const loginTrackedRef = useRef(false);

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  // Track login activity once per session
  useEffect(() => {
    if (isAuthenticated && !loginTrackedRef.current) {
      const sessionKey = 'login_tracked_' + identity?.getPrincipal().toString();
      if (!sessionStorage.getItem(sessionKey)) {
        loginTrackedRef.current = true;
        sessionStorage.setItem(sessionKey, '1');
        trackActivity.mutate({ eventType: EventType.login, courseId: null });
      }
    }
  }, [isAuthenticated, identity]);

  useEffect(() => {
    const handleHashChange = () => setRoute(getRoute());
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-navy border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-warm-text">Loading...</p>
        </div>
      </div>
    );
  }

  const navigate = (path: string) => {
    window.location.hash = path;
    setRoute(path);
  };

  const renderRoute = () => {
    switch (route) {
      case '/admin':
        return isAuthenticated ? (
          <AdminDashboard />
        ) : (
          <div className="min-h-screen bg-cream flex items-center justify-center">
            <div className="text-center space-y-4">
              <p className="text-navy font-semibold">Please log in to access the admin dashboard.</p>
              <LoginButton />
            </div>
          </div>
        );
      case '/portal':
        return isAuthenticated ? (
          <StudentPortal onNavigate={navigate} />
        ) : (
          <div className="min-h-screen bg-cream flex items-center justify-center">
            <div className="text-center space-y-4">
              <p className="text-navy font-semibold">Please log in to access the student portal.</p>
              <LoginButton />
            </div>
          </div>
        );
      case '/completed-sessions':
        return <CompletedSessions onBack={() => navigate('/')} />;
      default:
        return (
          <main>
            <Hero onNavigate={navigate} />
            <Services />
            <EnrollmentCTA />
          </main>
        );
    }
  };

  const showFooter =
    route === '/' || route === '/completed-sessions' || route === '/portal';

  return (
    <>
      {showProfileSetup && <ProfileSetup />}
      <div className="min-h-screen flex flex-col">
        <div className="flex-1">{renderRoute()}</div>
        {showFooter && <Footer onNavigate={navigate} />}
      </div>
      <Toaster richColors position="top-right" />
    </>
  );
}
