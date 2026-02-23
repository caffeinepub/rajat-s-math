import { Heart } from 'lucide-react';
import { SiWhatsapp, SiYoutube, SiLinkedin } from 'react-icons/si';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const appIdentifier = encodeURIComponent(
    typeof window !== 'undefined' ? window.location.hostname : 'rajats-equation'
  );

  return (
    <footer className="mt-20 border-t-2 border-[oklch(0.90_0.02_40)] bg-gradient-to-b from-[oklch(0.98_0.01_80)] to-[oklch(0.96_0.02_40)]">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 mb-12">
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <img 
                  src="/assets/generated/logo-rajats-equation.dim_512x512.png" 
                  alt="Rajat's Equation Logo"
                  className="w-12 h-12 object-contain"
                />
                <h3 className="text-2xl font-bold text-[oklch(0.20_0.05_240)] font-serif">
                  Rajat's Equation
                </h3>
              </div>
              <p className="text-[oklch(0.50_0.05_40)] leading-relaxed">
                Empowering students to achieve mathematical excellence through innovative teaching methods, personalized attention, and a passion for problem-solving.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-bold text-[oklch(0.25_0.06_240)] mb-4">
                Connect With Us
              </h4>
              <div className="flex flex-col gap-3">
                <a
                  href="https://wa.me/919424135055"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-5 py-3 bg-[oklch(0.45_0.15_145)] hover:bg-[oklch(0.40_0.15_145)] text-white rounded-lg transition-colors font-medium shadow-md w-fit"
                >
                  <SiWhatsapp className="w-5 h-5" />
                  <span>WhatsApp</span>
                </a>
                <a
                  href="https://www.youtube.com/channel/UCR9lkyJ3JIhlSx3_e06DTEw"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-5 py-3 bg-[oklch(0.50_0.20_25)] hover:bg-[oklch(0.45_0.20_25)] text-white rounded-lg transition-colors font-medium shadow-md w-fit"
                >
                  <SiYoutube className="w-5 h-5" />
                  <span>YouTube</span>
                </a>
                <a
                  href="https://www.linkedin.com/in/rajat-kumar-jain-460090233/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-5 py-3 bg-[oklch(0.35_0.15_240)] hover:bg-[oklch(0.30_0.15_240)] text-white rounded-lg transition-colors font-medium shadow-md w-fit"
                >
                  <SiLinkedin className="w-5 h-5" />
                  <span>LinkedIn</span>
                </a>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-[oklch(0.88_0.03_40)] text-center">
            <p className="text-sm text-[oklch(0.50_0.05_40)] flex items-center justify-center gap-2 flex-wrap">
              © {currentYear} Rajat's Equation. Built with{' '}
              <Heart className="w-4 h-4 fill-[oklch(0.55_0.15_40)] text-[oklch(0.55_0.15_40)]" />{' '}
              using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appIdentifier}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[oklch(0.45_0.10_40)] hover:text-[oklch(0.40_0.12_40)] underline underline-offset-4"
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
