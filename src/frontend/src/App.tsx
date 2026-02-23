import { Hero } from './components/Hero';
import { Services } from './components/Services';
import { EnrollmentCTA } from './components/EnrollmentCTA';
import { Footer } from './components/Footer';
import { LoginButton } from './components/LoginButton';
import { ProfileSetup } from './components/ProfileSetup';
import { Toaster } from './components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import { Skeleton } from './components/ui/skeleton';

function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  
  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

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
        <div className="fixed top-4 right-4 z-50">
          <LoginButton />
        </div>
        
        {showProfileSetup ? (
          <ProfileSetup />
        ) : (
          <>
            <Hero />
            <Services />
            <EnrollmentCTA />
            <Footer />
          </>
        )}
        
        <Toaster />
      </div>
    </ThemeProvider>
  );
}

export default App;
