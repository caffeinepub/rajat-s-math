import React, { useState, useEffect } from 'react';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useActor } from './hooks/useActor';
import Header from './components/Header';
import Hero from './components/Hero';
import Services from './components/Services';
import EnrollmentCTA from './components/EnrollmentCTA';
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
  | 'dashboard'
  | 'completed-sessions'
  | 'sessions'
  | 'courses'
  | 'enquiry-portal'
  | 'enquiry'
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

  const navigateTo = (view: string) => {
    // Map navigation aliases
    const viewMap: Record<string, View> = {
      home: 'home',
      admin: 'admin',
      'student-portal': 'student-portal',
      'student-dashboard': 'student-dashboard',
      dashboard: 'dashboard',
      'completed-sessions': 'completed-sessions',
      sessions: 'completed-sessions',
      courses: 'home',
      'enquiry-portal': 'enquiry-portal',
      enquiry: 'enquiry-form',
      'enquiry-form': 'enquiry-form',
      'qr-checkin': 'qr-checkin',
    };
    const mapped = (viewMap[view] ?? 'home') as View;
    setCurrentView(mapped);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // If navigating to courses, scroll to services section
    if (view === 'courses') {
      setTimeout(() => {
        document.getElementById('courses')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--cream)' }}>
        <div className="text-center space-y-4">
          <div
            className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin mx-auto"
            style={{ borderColor: 'var(--gold)', borderTopColor: 'transparent' }}
          />
          <p className="text-sm font-medium" style={{ color: 'oklch(0.55 0.03 240)' }}>
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--cream)' }}>
      <Toaster />
      <Header onNavigate={navigateTo} currentView={currentView} />

      {showProfileSetup && <ProfileSetup />}

      <main className="flex-1 pt-16 lg:pt-20">
        {currentView === 'home' && (
          <>
            <Hero onNavigate={navigateTo} />
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
              <p className="text-xl font-semibold" style={{ color: 'var(--navy)' }}>Access Denied</p>
              <p style={{ color: 'oklch(0.55 0.03 240)' }}>You do not have admin privileges.</p>
            </div>
          </div>
        )}

        {currentView === 'student-portal' && <StudentPortal />}

        {(currentView === 'student-dashboard' || currentView === 'dashboard') && (
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

      <Footer onNavigate={navigateTo} />
    </div>
  );
}
