import { Heart, CheckCircle } from 'lucide-react';
import { SiWhatsapp, SiYoutube, SiLinkedin, SiInstagram } from 'react-icons/si';
import { AuthGate } from './AuthGate';

interface FooterProps {
  onNavigate: (route: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const appIdentifier = encodeURIComponent(
    typeof window !== 'undefined' ? window.location.hostname : 'rajats-equation'
  );

  const openWhatsApp = () => window.open('https://wa.me/919424135055', '_blank', 'noopener,noreferrer');
  const openInstagram = () => window.open('https://www.instagram.com/rkjain364', '_blank', 'noopener,noreferrer');
  const openYouTube = () => window.open('https://www.youtube.com/channel/UCR9lkyJ3JIhlSx3_e06DTEw', '_blank', 'noopener,noreferrer');
  const openLinkedIn = () => window.open('https://www.linkedin.com/in/rajat-kumar-jain-460090233/', '_blank', 'noopener,noreferrer');

  return (
    <footer className="mt-20 border-t-2 border-border-warm bg-gradient-to-b from-cream to-warm-light">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12 mb-12">
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <img
                  src="/assets/rajat's eqn logo -1-1.jpeg"
                  alt="Rajat's Equation Logo"
                  className="h-16 w-auto object-contain"
                />
              </div>
              <p className="text-warm-text leading-relaxed">
                Empowering students to achieve mathematical excellence through innovative teaching methods, personalized attention, and a passion for problem-solving.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-bold text-navy mb-4">
                Connect With Us
              </h4>
              <div className="flex flex-col gap-3">
                {/* WhatsApp — auth gated */}
                <AuthGate onAction={openWhatsApp}>
                  <button
                    type="button"
                    className="flex items-center gap-3 px-5 py-3 bg-[oklch(0.45_0.15_145)] hover:bg-[oklch(0.40_0.15_145)] text-white rounded-lg transition-colors font-medium shadow-md w-fit"
                  >
                    <SiWhatsapp className="w-5 h-5" />
                    <span>WhatsApp</span>
                  </button>
                </AuthGate>

                {/* Instagram — auth gated */}
                <AuthGate onAction={openInstagram}>
                  <button
                    type="button"
                    className="flex items-center gap-3 px-5 py-3 bg-[oklch(0.55_0.18_340)] hover:bg-[oklch(0.50_0.18_340)] text-white rounded-lg transition-colors font-medium shadow-md w-fit"
                  >
                    <SiInstagram className="w-5 h-5" />
                    <span>Instagram @rkjain364</span>
                  </button>
                </AuthGate>

                {/* YouTube — auth gated */}
                <AuthGate onAction={openYouTube}>
                  <button
                    type="button"
                    className="flex items-center gap-3 px-5 py-3 bg-[oklch(0.50_0.20_25)] hover:bg-[oklch(0.45_0.20_25)] text-white rounded-lg transition-colors font-medium shadow-md w-fit"
                  >
                    <SiYoutube className="w-5 h-5" />
                    <span>YouTube</span>
                  </button>
                </AuthGate>

                {/* LinkedIn — auth gated */}
                <AuthGate onAction={openLinkedIn}>
                  <button
                    type="button"
                    className="flex items-center gap-3 px-5 py-3 bg-[oklch(0.35_0.15_240)] hover:bg-[oklch(0.30_0.15_240)] text-white rounded-lg transition-colors font-medium shadow-md w-fit"
                  >
                    <SiLinkedin className="w-5 h-5" />
                    <span>LinkedIn</span>
                  </button>
                </AuthGate>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-bold text-navy mb-4">
                Quick Links
              </h4>
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => onNavigate('/completed-sessions')}
                  className="flex items-center gap-3 px-5 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium shadow-md w-fit"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Completed Sessions</span>
                </button>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-border-warm text-center">
            <p className="text-sm text-warm-text flex items-center justify-center gap-2 flex-wrap">
              © {currentYear} Rajat's Equation. Built with{' '}
              <Heart className="w-4 h-4 fill-gold text-gold" />{' '}
              using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appIdentifier}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-navy hover:text-navy/70 underline underline-offset-4"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
