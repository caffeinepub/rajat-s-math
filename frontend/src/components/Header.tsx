import React, { useState, useEffect } from 'react';
import { GraduationCap, Menu, X, LayoutDashboard, BookOpen, Calendar, MessageSquare, QrCode } from 'lucide-react';
import { LoginButton } from './LoginButton';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsAdmin } from '../hooks/useQueries';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { identity } = useInternetIdentity();
  const { data: isAdmin } = useIsAdmin();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'courses', label: 'Courses' },
    { id: 'sessions', label: 'Sessions' },
    { id: 'enquiry', label: 'Enquiry' },
    { id: 'student-portal', label: 'Student Portal', icon: GraduationCap },
  ];

  const handleNav = (view: string) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'shadow-md' : ''
      }`}
      style={{ background: 'white', borderBottom: '1px solid oklch(0.92 0.01 240)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <button
            onClick={() => handleNav('home')}
            className="flex items-center gap-3 group flex-shrink-0"
          >
            <div
              className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0"
              style={{ border: '1px solid oklch(0.90 0.01 240)' }}
            >
              <img
                src="/assets/rajat's equation logo.jpg"
                alt="Rajat's Equation"
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.style.background = 'var(--navy)';
                    parent.style.display = 'flex';
                    parent.style.alignItems = 'center';
                    parent.style.justifyContent = 'center';
                    parent.innerHTML = '<span style="color:var(--gold);font-family:Playfair Display,serif;font-weight:700;font-size:18px">R</span>';
                  }
                }}
              />
            </div>
            <div className="hidden sm:block">
              <span
                className="text-lg font-bold leading-tight block"
                style={{ fontFamily: "'Playfair Display', serif", color: 'var(--navy)' }}
              >
                Rajat's Equation
              </span>
              <span className="text-xs font-medium" style={{ color: 'var(--gold)' }}>
                Mathematics Platform
              </span>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = currentView === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNav(link.id)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                  style={{
                    background: isActive ? 'var(--navy)' : 'transparent',
                    color: isActive ? 'white' : 'oklch(0.40 0.03 240)',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'oklch(0.95 0.01 240)';
                      e.currentTarget.style.color = 'var(--navy)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'oklch(0.40 0.03 240)';
                    }
                  }}
                >
                  {Icon && <Icon size={14} />}
                  {link.label}
                </button>
              );
            })}
            {isAdmin && (
              <button
                onClick={() => handleNav('admin')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                style={{
                  background: currentView === 'admin' ? 'var(--gold)' : 'transparent',
                  color: currentView === 'admin' ? 'var(--navy)' : 'oklch(0.40 0.03 240)',
                }}
                onMouseEnter={(e) => {
                  if (currentView !== 'admin') {
                    e.currentTarget.style.background = 'oklch(0.95 0.01 240)';
                    e.currentTarget.style.color = 'var(--navy)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentView !== 'admin') {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'oklch(0.40 0.03 240)';
                  }
                }}
              >
                <LayoutDashboard size={14} />
                Admin
              </button>
            )}
          </nav>

          {/* Right side */}
          <div className="hidden lg:flex items-center gap-3">
            <LoginButton />
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg transition-colors"
            style={{ color: 'oklch(0.40 0.03 240)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'oklch(0.95 0.01 240)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden border-t"
          style={{ background: 'white', borderColor: 'oklch(0.92 0.01 240)' }}
        >
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = currentView === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNav(link.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 text-left"
                  style={{
                    background: isActive ? 'var(--navy)' : 'transparent',
                    color: isActive ? 'white' : 'oklch(0.40 0.03 240)',
                  }}
                >
                  {Icon && <Icon size={16} />}
                  {link.label}
                </button>
              );
            })}
            {isAdmin && (
              <button
                onClick={() => handleNav('admin')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 text-left"
                style={{
                  background: currentView === 'admin' ? 'var(--gold)' : 'transparent',
                  color: currentView === 'admin' ? 'var(--navy)' : 'oklch(0.40 0.03 240)',
                }}
              >
                <LayoutDashboard size={16} />
                Admin Dashboard
              </button>
            )}
            <div className="pt-3 border-t" style={{ borderColor: 'oklch(0.92 0.01 240)' }}>
              <LoginButton />
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
