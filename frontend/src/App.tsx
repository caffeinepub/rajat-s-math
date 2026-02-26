import React, { useState, useEffect } from 'react';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useActor } from './hooks/useActor';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Services } from './components/Services';
import { EnrollmentCTA } from './components/EnrollmentCTA';
import { Footer } from './components/Footer';
import { ProfileSetup } from './components/ProfileSetup';
import AdminDashboard from './components/AdminDashboard';
import StudentPortal from './components/StudentPortal';
import StudentDashboard from './components/StudentDashboard';
import CompletedSessions from './components/CompletedSessions';
import StudentEnquiryPortal from './components/StudentEnquiryPortal';
import StudentEnquiryForm from './components/StudentEnquiryForm';
import QRCheckInView from './components/QRCheckInView';
import { useGetCallerUserProfile } from './hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';

type View =
  | 'home'
  | 'admin'
  | 'student-portal'
  | 'student-dashboard'
  | 'completed-sessions'
  | 'enquiry-portal'
  | 'enquiry-form'
  | 'qr-checkin';

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const isAuthenticated = !!identity;
  const queryClient = useQueryClient();

  const [currentView, setCurrentView] = useState<View>('home');
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminCheckDone, setAdminCheckDone] = useState(false);

  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched: profileFetched,
  } = useGetCallerUserProfile();

  // Check admin status whenever actor becomes available
  useEffect(() => {
    if (!actor || actorFetching || !isAuthenticated) {
      setIsAdmin(false);
      setAdminCheckDone(!isAuthenticated);
      return;
    }

    actor
      .isCallerAdmin()
      .then((result: boolean) => {
        setIsAdmin(result);
        setAdminCheckDone(true);
      })
      .catch(() => {
        setIsAdmin(false);
        setAdminCheckDone(true);
      });
  }, [actor, actorFetching, isAuthenticated]);

  // Reset view and state when logging out
  useEffect(() => {
    if (!isAuthenticated) {
      setCurrentView('home');
      setIsAdmin(false);
      setAdminCheckDone(false);
    }
  }, [isAuthenticated]);

  const showProfileSetup =
    isAuthenticated && !profileLoading && profileFetched && userProfile === null;

  const navigateTo = (view: View) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Toaster />
      <Header onNavigate={navigateTo} currentView={currentView} />

      {showProfileSetup && <ProfileSetup />}

      <main className="flex-1">
        {currentView === 'home' && (
          <>
            <Hero
              onNavigate={navigateTo}
              isAuthenticated={isAuthenticated}
              isAdmin={isAdmin}
            />
            <Services />
            <EnrollmentCTA />
          </>
        )}

        {currentView === 'admin' && isAuthenticated && isAdmin && (
          <AdminDashboard />
        )}

        {currentView === 'admin' && isAuthenticated && adminCheckDone && !isAdmin && (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-2">
              <p className="text-xl font-semibold text-foreground">Access Denied</p>
              <p className="text-muted-foreground">You do not have admin privileges.</p>
            </div>
          </div>
        )}

        {currentView === 'student-portal' && <StudentPortal />}

        {currentView === 'student-dashboard' && (
          <StudentDashboard />
        )}

        {currentView === 'completed-sessions' && <CompletedSessions />}

        {currentView === 'enquiry-form' && (
          <StudentEnquiryForm onBack={() => navigateTo('home')} />
        )}

        {currentView === 'enquiry-portal' && (
          <StudentEnquiryPortal />
        )}

        {currentView === 'qr-checkin' && (
          <QRCheckInView />
        )}
      </main>

      <Footer />
    </div>
  );
}
