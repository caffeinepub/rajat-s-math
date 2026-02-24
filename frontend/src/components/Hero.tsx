import { Brain, Sparkles, Download, LayoutDashboard } from 'lucide-react';
import { SiInstagram } from 'react-icons/si';
import { Button } from './ui/button';
import { useInstallPrompt } from '../hooks/useInstallPrompt';
import { AuthGate } from './AuthGate';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsCallerAdmin } from '../hooks/useQueries';

interface HeroProps {
  onNavigate: (route: string) => void;
}

export function Hero({ onNavigate }: HeroProps) {
  const { canInstall, installApp, isInstalled } = useInstallPrompt();
  const { identity } = useInternetIdentity();
  const { data: isAdmin } = useIsCallerAdmin();

  const isAuthenticated = !!identity;

  const scrollToServices = () => {
    const element = document.getElementById('services');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToEnrollment = () => {
    const element = document.getElementById('enrollment');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  const openInstagram = () => {
    window.open('https://www.instagram.com/rkjain364', '_blank', 'noopener,noreferrer');
  };

  return (
    <header className="relative overflow-hidden bg-gradient-to-br from-cream via-warm-light to-[oklch(0.98_0.01_80)]">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-64 h-64 bg-navy rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-navy rounded-full blur-3xl" />
      </div>

      <div className="container relative mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="flex justify-center mb-6">
            <img
              src="/assets/rajat's eqn logo -1-1.jpeg"
              alt="Rajat's Equation Logo"
              className="h-32 md:h-40 w-auto object-contain"
            />
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-navy text-sm font-medium text-navy">
            <Sparkles className="w-4 h-4" />
            <span>Powered by Rajat's Equation</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-navy leading-tight font-serif">
            Rajat's Equation
            <br />
            <span className="text-navy/70 text-4xl md:text-5xl font-sans mt-2 block">Master Mathematical Thinking</span>
          </h1>

          <p className="text-xl md:text-2xl text-warm-text max-w-2xl mx-auto leading-relaxed">
            Transform your mathematical abilities with expert guidance. From IOQM and NMTC preparation to building strong foundations, we help students excel in mathematics through innovative teaching methods.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4 flex-wrap">
            {/* Enroll Now — auth gated */}
            <AuthGate onAction={scrollToEnrollment}>
              <Button
                size="lg"
                className="text-lg px-8 py-6 bg-navy hover:bg-navy/90 text-white shadow-lg"
              >
                <Brain className="w-5 h-5 mr-2" />
                Enroll Now
              </Button>
            </AuthGate>

            {/* Explore Programs — auth gated */}
            <AuthGate onAction={scrollToServices}>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 border-2 border-navy text-navy hover:bg-navy hover:text-white"
              >
                Explore Programs
              </Button>
            </AuthGate>

            {/* Instagram link — auth gated */}
            <AuthGate onAction={openInstagram}>
              <button
                type="button"
                className="flex items-center gap-2 text-lg px-8 py-4 rounded-lg border-2 border-[oklch(0.55_0.18_340)] text-[oklch(0.55_0.18_340)] hover:bg-[oklch(0.55_0.18_340)] hover:text-white transition-colors font-semibold"
              >
                <SiInstagram className="w-5 h-5" />
                @rkjain364
              </button>
            </AuthGate>

            {/* Admin Dashboard — only visible to admin */}
            {isAuthenticated && isAdmin && (
              <Button
                size="lg"
                onClick={() => onNavigate('/admin')}
                className="text-lg px-8 py-6 bg-gold hover:bg-gold-dark text-white shadow-lg"
              >
                <LayoutDashboard className="w-5 h-5 mr-2" />
                Admin Dashboard
              </Button>
            )}

            {canInstall && !isInstalled && (
              <Button
                size="lg"
                onClick={installApp}
                className="text-lg px-8 py-6 bg-[oklch(0.60_0.12_140)] hover:bg-[oklch(0.65_0.12_140)] text-white shadow-lg"
              >
                <Download className="w-5 h-5 mr-2" />
                Install App
              </Button>
            )}
          </div>
        </div>

        <div className="mt-16 max-w-5xl mx-auto">
          <img
            src="/assets/generated/hero-banner.dim_1200x600.png"
            alt="Mathematical excellence and innovative learning"
            className="w-full rounded-2xl shadow-2xl border-4 border-white"
          />
        </div>
      </div>
    </header>
  );
}
