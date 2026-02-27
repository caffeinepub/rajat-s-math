import React from 'react';
import { GraduationCap, Phone, Mail, MapPin, Heart, ExternalLink, Youtube, MessageCircle } from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';

interface FooterProps {
  onNavigate?: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const currentYear = new Date().getFullYear();
  const appId = encodeURIComponent(window.location.hostname || 'rajats-equation');

  const quickLinks = [
    { label: 'Home', view: 'home' },
    { label: 'Courses & Pricing', view: 'courses' },
    { label: 'Completed Sessions', view: 'sessions' },
    { label: 'Student Portal', view: 'student-portal' },
    { label: 'Enquiry', view: 'enquiry' },
  ];

  const contactInfo = [
    { icon: Phone, text: '+91 94241 35055', href: 'tel:+919424135055' },
    { icon: Mail, text: 'rajat@equation.edu', href: 'mailto:rajat@equation.edu' },
    { icon: MapPin, text: 'India', href: null },
  ];

  return (
    <footer style={{ background: 'var(--navy-dark)' }}>
      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl overflow-hidden border-2" style={{ borderColor: 'var(--gold)' }}>
                <img
                  src="/assets/rajat's equation logo.jpg"
                  alt="Rajat's Equation"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const t = e.target as HTMLImageElement;
                    t.style.display = 'none';
                    t.parentElement!.style.background = 'var(--navy-light)';
                    t.parentElement!.innerHTML = '<span style="color:var(--gold);font-family:Playfair Display,serif;font-weight:700;font-size:22px;display:flex;align-items:center;justify-content:center;height:100%">R</span>';
                  }}
                />
              </div>
              <div>
                <h3
                  className="text-xl font-bold text-white"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Rajat's Equation
                </h3>
                <p className="text-xs font-medium" style={{ color: 'var(--gold)' }}>
                  Mathematics Platform
                </p>
              </div>
            </div>

            <p className="text-sm leading-relaxed mb-6 max-w-sm" style={{ color: 'oklch(0.65 0.02 240)' }}>
              Empowering students to master mathematics through personalized tutoring, structured learning, and expert guidance. Where equations meet excellence.
            </p>

            {/* Social links */}
            <div className="flex gap-3">
              <a
                href="https://wa.me/919424135055"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200"
                style={{ background: 'oklch(1 0 0 / 0.08)' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--gold)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'oklch(1 0 0 / 0.08)'; }}
              >
                <SiWhatsapp size={16} className="text-white" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200"
                style={{ background: 'oklch(1 0 0 / 0.08)' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--gold)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'oklch(1 0 0 / 0.08)'; }}
              >
                <Youtube size={16} className="text-white" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4
              className="text-base font-bold text-white mb-6"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Quick Links
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.view}>
                  <button
                    onClick={() => onNavigate?.(link.view)}
                    className="text-sm transition-colors duration-200 text-left"
                    style={{ color: 'oklch(0.65 0.02 240)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--gold)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'oklch(0.65 0.02 240)'; }}
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4
              className="text-base font-bold text-white mb-6"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Contact Us
            </h4>
            <ul className="space-y-4">
              {contactInfo.map((item, i) => {
                const Icon = item.icon;
                const content = (
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: 'oklch(1 0 0 / 0.08)' }}
                    >
                      <Icon size={14} style={{ color: 'var(--gold)' }} />
                    </div>
                    <span className="text-sm" style={{ color: 'oklch(0.65 0.02 240)' }}>
                      {item.text}
                    </span>
                  </div>
                );

                return (
                  <li key={i}>
                    {item.href ? (
                      <a
                        href={item.href}
                        className="transition-opacity duration-200 hover:opacity-80"
                      >
                        {content}
                      </a>
                    ) : (
                      content
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        className="border-t"
        style={{ borderColor: 'oklch(1 0 0 / 0.08)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs" style={{ color: 'oklch(0.50 0.02 240)' }}>
              © {currentYear} Rajat's Equation. All rights reserved.
            </p>
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs transition-opacity duration-200 hover:opacity-80"
              style={{ color: 'oklch(0.50 0.02 240)' }}
            >
              Built with <Heart size={12} style={{ color: 'var(--gold)' }} fill="currentColor" /> using
              <span style={{ color: 'var(--gold)' }}>caffeine.ai</span>
              <ExternalLink size={10} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
