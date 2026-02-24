import { useState, useEffect, useRef } from 'react';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Hero } from './components/Hero';
import { Services } from './components/Services';
import { EnrollmentCTA } from './components/EnrollmentCTA';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { ProfileSetup } from './components/ProfileSetup';
import { CompletedSessions } from './components/CompletedSessions';
import AdminDashboard from './components/AdminDashboard';
import StudentPortal from './components/StudentPortal';
import { useGetCallerUserProfile, useIsCallerAdmin } from './hooks/useQueries';
import { Loader2, Shield } from 'lucide-react';
import { LoginButton } from './components/LoginButton';
import { Toaster } from './components/ui/sonner';

type Page = 'home' | 'admin' | 'student-portal' | 'completed-sessions';

function getPageFromHash(): Page {
  const hash = window.location.hash.replace('#', '').replace('/', '');
  if (hash === 'admin') return 'admin';
  if (hash === 'student-portal') return 'student-portal';
  if (hash === 'completed-sessions') return 'completed-sessions';
  return 'home';
}

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const queryClient = useQueryClient();
  const isAuthenticated = !!identity;

  const [currentPage, setCurrentPage] = useState<Page>(getPageFromHash);

  const { data: userProfile, isLoading: profileLoading, isFetched: profileFetched } = useGetCallerUserProfile();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();

  // Track previous identity to detect login events
  const prevIdentityRef = useRef<typeof identity>(undefined);
  const hasRedirectedRef = useRef(false);

  // Handle hash-based routing
  useEffect(() => {
    const handleHashChange = () => {
      setCurrentPage(getPageFromHash());
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Clear cache on logout
  useEffect(() => {
    if (!isAuthenticated) {
      queryClient.removeQueries({ queryKey: ['currentUserProfile'] });
      hasRedirectedRef.current = false;
    }
  }, [isAuthenticated, queryClient]);

  // Post-login redirect: admin → #admin, others → home
  useEffect(() => {
    const wasLoggedOut = !prevIdentityRef.current;
    const isNowLoggedIn = !!identity;

    if (wasLoggedOut && isNowLoggedIn && !adminLoading && !hasRedirectedRef.current) {
      hasRedirectedRef.current = true;
      if (isAdmin === true) {
        navigate('admin');
      } else if (isAdmin === false) {
        navigate('home');
      }
      // If isAdmin is still undefined, wait for next render
    }

    prevIdentityRef.current = identity;
  }, [identity, isAdmin, adminLoading]);

  // Once admin status resolves after login, do the redirect if not done yet
  useEffect(() => {
    if (isAuthenticated && !adminLoading && !hasRedirectedRef.current && prevIdentityRef.current) {
      hasRedirectedRef.current = true;
      if (isAdmin === true) {
        navigate('admin');
      }
      // Non-admin stays on current page
    }
  }, [isAdmin, adminLoading, isAuthenticated]);

  const navigate = (page: Page) => {
    window.location.hash = page === 'home' ? '/' : page;
    setCurrentPage(page);
  };

  const showProfileSetup =
    isAuthenticated && !profileLoading && profileFetched && userProfile === null;

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Admin route guard
  if (currentPage === 'admin') {
    if (!isAuthenticated) {
      return (
        <div className="min-h-screen bg-background flex flex-col">
          <Header onNavigate={navigate} currentPage={currentPage} />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center p-8 space-y-4">
              <Shield className="w-16 h-16 text-muted-foreground mx-auto" />
              <h2 className="text-2xl font-bold text-foreground">Authentication Required</h2>
              <p className="text-muted-foreground">Please log in to access the admin dashboard.</p>
              <LoginButton />
              <div>
                <button
                  onClick={() => navigate('home')}
                  className="text-primary hover:underline text-sm"
                >
                  Return to Home
                </button>
              </div>
            </div>
          </div>
          <Toaster richColors position="top-right" />
        </div>
      );
    }
    if (adminLoading) {
      return (
        <div className="min-h-screen bg-background flex flex-col">
          <Header onNavigate={navigate} currentPage={currentPage} />
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <p className="text-muted-foreground">Verifying admin access...</p>
            </div>
          </div>
          <Toaster richColors position="top-right" />
        </div>
      );
    }
    if (isAdmin === false) {
      return (
        <div className="min-h-screen bg-background flex flex-col">
          <Header onNavigate={navigate} currentPage={currentPage} />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center p-8 space-y-4">
              <Shield className="w-16 h-16 text-destructive mx-auto" />
              <h2 className="text-2xl font-bold text-foreground">Access Denied</h2>
              <p className="text-muted-foreground">You do not have permission to access the admin dashboard.</p>
              <button
                onClick={() => navigate('home')}
                className="text-primary hover:underline text-sm"
              >
                Return to Home
              </button>
            </div>
          </div>
          <Toaster richColors position="top-right" />
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header onNavigate={navigate} currentPage={currentPage} />
        <main className="flex-1">
          <AdminDashboard />
        </main>
        <Toaster richColors position="top-right" />
      </div>
    );
  }

  if (currentPage === 'student-portal') {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header onNavigate={navigate} currentPage={currentPage} />
        <main className="flex-1">
          <StudentPortal onNavigate={(path) => navigate(path.replace('/', '') as Page)} />
        </main>
        <Toaster richColors position="top-right" />
      </div>
    );
  }

  if (currentPage === 'completed-sessions') {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header onNavigate={navigate} currentPage={currentPage} />
        <main className="flex-1">
          <CompletedSessions onBack={() => navigate('home')} />
        </main>
        <Toaster richColors position="top-right" />
      </div>
    );
  }

  // Home page
  return (
    <>
      {showProfileSetup && <ProfileSetup />}
      <div className="min-h-screen flex flex-col">
        <Header onNavigate={navigate} currentPage={currentPage} />
        <main className="flex-1">
          <Hero onNavigate={(path) => navigate(path.replace('/', '') as Page)} />
          <Services />
          <EnrollmentCTA />
        </main>
        <Footer onNavigate={(path) => navigate(path.replace('/', '') as Page)} />
      </div>
      <Toaster richColors position="top-right" />
    </>
  );
}
