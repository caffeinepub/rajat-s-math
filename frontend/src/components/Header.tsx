import React, { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useIsAdmin } from '../hooks/useQueries';
import { Button } from './ui/button';
import { LogIn, LogOut, Loader2, GraduationCap, Menu, X, LayoutDashboard, Home, BookOpen, CheckSquare, FileQuestion, QrCode } from 'lucide-react';

type View = 'home' | 'admin' | 'student-portal' | 'completed-sessions' | 'enquiry-form' | 'enquiry-portal' | 'qr-checkin';

interface HeaderProps {
  onNavigate?: (view: View) => void;
  currentView?: string;
}

export function Header({ onNavigate, currentView }: HeaderProps) {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: isAdmin } = useIsAdmin();
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const handleLogin = async () => {
    try {
      await login();
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.message === 'User is already authenticated') {
        await clear();
        setTimeout(() => login(), 300);
      }
    }
  };

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    onNavigate?.('home');
  };

  const navLinks: { label: string; view: View; scrollTo?: string; icon?: React.ReactNode }[] = [
    { label: 'Home', view: 'home', icon: <Home className="w-3.5 h-3.5" /> },
    { label: 'Courses', view: 'home', scrollTo: 'services', icon: <BookOpen className="w-3.5 h-3.5" /> },
    { label: 'Sessions', view: 'completed-sessions', icon: <CheckSquare className="w-3.5 h-3.5" /> },
    { label: 'Enquiry', view: 'enquiry-form', icon: <FileQuestion className="w-3.5 h-3.5" /> },
    { label: 'Student Portal', view: 'student-portal', icon: <GraduationCap className="w-3.5 h-3.5" /> },
  ];

  const handleNavClick = (view: View, scrollTo?: string) => {
    setMobileMenuOpen(false);
    if (scrollTo) {
      onNavigate?.('home');
      setTimeout(() => {
        document.getElementById(scrollTo)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      onNavigate?.(view);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-navy/97 backdrop-blur-sm border-b border-gold/20 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo — always on the far left */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2.5 group flex-shrink-0 mr-4"
            aria-label="Go to home"
          >
            {!logoError ? (
              <img
                src="/assets/rajat's equation logo.jpg"
                alt="Rajat's Equation Logo"
                className="h-11 w-auto object-contain rounded"
                onError={() => setLogoError(true)}
              />
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-gold flex items-center justify-center flex-shrink-0">
                  <span className="text-navy font-bold text-lg leading-none" style={{ fontFamily: 'Playfair Display, serif' }}>R</span>
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="text-cream font-bold text-sm tracking-wide" style={{ fontFamily: 'Playfair Display, serif' }}>Rajat's</span>
                  <span className="text-gold font-bold text-sm tracking-wide" style={{ fontFamily: 'Playfair Display, serif' }}>Equation</span>
                </div>
              </div>
            )}
          </button>

          {/* Desktop Nav — right-aligned */}
          <nav className="hidden md:flex items-center gap-0.5 ml-auto">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNavClick(link.view, link.scrollTo)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === link.view && !link.scrollTo
                    ? 'text-gold bg-gold/10'
                    : 'text-cream/70 hover:text-cream hover:bg-cream/10'
                }`}
              >
                {link.icon}
                {link.label}
              </button>
            ))}

            {/* Admin Dashboard link — only for admin */}
            {isAuthenticated && isAdmin === true && (
              <button
                onClick={() => handleNavClick('admin')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-semibold transition-colors border ml-1 ${
                  currentView === 'admin'
                    ? 'text-navy bg-gold border-gold'
                    : 'text-gold bg-gold/15 border-gold/40 hover:bg-gold/25 hover:border-gold hover:text-gold'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Admin
              </button>
            )}

            {/* Auth Button */}
            <div className="ml-2 pl-2 border-l border-gold/20">
              {isAuthenticated ? (
                <Button
                  onClick={handleLogout}
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold shadow-sm border border-red-500"
                >
                  <LogOut className="w-4 h-4 mr-1.5" />
                  Logout
                </Button>
              ) : (
                <Button
                  onClick={handleLogin}
                  disabled={isLoggingIn}
                  size="sm"
                  className="bg-gold hover:bg-gold/90 text-navy font-semibold border border-gold/60"
                >
                  {isLoggingIn ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                  ) : (
                    <LogIn className="w-4 h-4 mr-1.5" />
                  )}
                  {isLoggingIn ? 'Logging in...' : 'Login'}
                </Button>
              )}
            </div>
          </nav>

          {/* Mobile: Auth Button + Hamburger */}
          <div className="flex md:hidden items-center gap-2 ml-auto">
            {isAuthenticated ? (
              <Button
                onClick={handleLogout}
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white font-semibold shadow-sm border border-red-500 text-xs px-2"
              >
                <LogOut className="w-3.5 h-3.5" />
              </Button>
            ) : (
              <Button
                onClick={handleLogin}
                disabled={isLoggingIn}
                size="sm"
                className="bg-gold hover:bg-gold/90 text-navy font-semibold border border-gold/60 text-xs px-2"
              >
                {isLoggingIn ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <LogIn className="w-3.5 h-3.5" />
                )}
              </Button>
            )}
            <button
              className="text-cream hover:text-gold transition-colors p-1"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gold/20 py-3 space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNavClick(link.view, link.scrollTo)}
                className={`flex items-center gap-2 w-full px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  currentView === link.view && !link.scrollTo
                    ? 'text-gold bg-gold/10'
                    : 'text-cream/70 hover:text-cream hover:bg-cream/10'
                }`}
              >
                {link.icon}
                {link.label}
              </button>
            ))}

            {isAuthenticated && isAdmin === true && (
              <button
                onClick={() => handleNavClick('admin')}
                className={`flex items-center gap-2 w-full px-3 py-2.5 rounded-md text-sm font-semibold transition-colors ${
                  currentView === 'admin'
                    ? 'text-navy bg-gold'
                    : 'text-gold bg-gold/10 hover:bg-gold/20'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Admin Dashboard
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
