import React from 'react';
import { Heart, GraduationCap } from 'lucide-react';

interface FooterProps {
  onNavigate?: (path: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const appId = encodeURIComponent(window.location.hostname || 'rajats-equation');
  const caffeineUrl = `https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appId}`;

  return (
    <footer className="bg-navy text-cream/70 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <img
                src="/assets/rajat's eqn logo -1-1.jpeg"
                alt="Rajat's Equation"
                className="w-8 h-8 rounded-full object-cover border border-gold/40"
              />
              <span className="text-cream font-serif font-semibold">Rajat's Equation</span>
            </div>
            <p className="text-sm leading-relaxed">
              Empowering students through personalized mathematics education and expert tutoring.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-cream font-semibold mb-3 text-sm uppercase tracking-wider">
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => onNavigate?.('/')}
                  className="hover:text-gold transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() =>
                    document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })
                  }
                  className="hover:text-gold transition-colors"
                >
                  Courses &amp; Pricing
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate?.('/completed-sessions')}
                  className="hover:text-gold transition-colors"
                >
                  Completed Sessions
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate?.('/portal')}
                  className="hover:text-gold transition-colors flex items-center gap-1.5"
                >
                  <GraduationCap className="w-3.5 h-3.5 text-gold" />
                  Student Portal
                </button>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-cream font-semibold mb-3 text-sm uppercase tracking-wider">
              Contact
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://wa.me/919424135055"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gold transition-colors"
                >
                  WhatsApp: +91 94241 35055
                </a>
              </li>
              <li className="text-cream/50 text-xs mt-2">
                For access code support, contact your instructor directly.
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-cream/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-cream/40">
          <p>© {new Date().getFullYear()} Rajat's Equation. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with{' '}
            <Heart className="w-3 h-3 text-gold fill-gold mx-0.5" />
            {' '}using{' '}
            <a
              href={caffeineUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold hover:text-gold/80 transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
