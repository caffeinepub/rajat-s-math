import { useState } from 'react';
import { Hero } from './components/Hero';
import { Services } from './components/Services';
import { EnrollmentCTA } from './components/EnrollmentCTA';
import { Footer } from './components/Footer';
import { LoginButton } from './components/LoginButton';
import { ProfileSetup } from './components/ProfileSetup';
import { AdminDashboard } from './components/AdminDashboard';
import { CompletedSessions } from './components/CompletedSessions';
import { Toaster } from './components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import { Skeleton } from './components/ui/skeleton';

type Route = '/' | '/admin' | '/completed-sessions';

function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const [currentRoute, setCurrentRoute] = useState<Route>('/');

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  const navigate = (route: string) => {
    setCurrentRoute(route as Route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isInitializing) {
    return (
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center space-y-4">
            <Skeleton className="h-12 w-64 mx-auto" />
            <Skeleton className="h-6 w-48 mx-auto" />
          </div>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <div className="min-h-screen bg-background">
        {/* Login button always visible in top-right corner (only on home page) */}
        {currentRoute === '/' && (
          <div className="fixed top-4 right-4 z-50">
            <LoginButton />
          </div>
        )}

        {currentRoute === '/admin' ? (
          <AdminDashboard onBack={() => navigate('/')} />
        ) : currentRoute === '/completed-sessions' ? (
          <CompletedSessions onBack={() => navigate('/')} />
        ) : showProfileSetup ? (
          <ProfileSetup />
        ) : (
          <>
            <Hero onNavigate={navigate} />
            <Services />
            <EnrollmentCTA />
            <Footer onNavigate={navigate} />
          </>
        )}

        <Toaster />
      </div>
    </ThemeProvider>
  );
}

export default App;
