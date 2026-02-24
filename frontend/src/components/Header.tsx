import React, { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useIsCallerAdmin } from '../hooks/useQueries';
import { Button } from './ui/button';
import { LogIn, LogOut, Loader2, Shield, GraduationCap, Menu, X } from 'lucide-react';

type Page = 'home' | 'admin' | 'student-portal' | 'completed-sessions';

interface HeaderProps {
  onNavigate?: (page: Page) => void;
  currentPage?: string;
}

export function Header({ onNavigate, currentPage }: HeaderProps) {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: isAdmin } = useIsCallerAdmin();
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const navLinks: { label: string; page: Page; scrollTo?: string; icon?: React.ReactNode }[] = [
    { label: 'Home', page: 'home' },
    { label: 'Courses', page: 'home', scrollTo: 'services' },
    { label: 'Completed Sessions', page: 'completed-sessions' },
    { label: 'Student Portal', page: 'student-portal', icon: <GraduationCap className="w-3.5 h-3.5" /> },
  ];

  const handleNavClick = (page: Page, scrollTo?: string) => {
    setMobileMenuOpen(false);
    if (scrollTo) {
      onNavigate?.('home');
      setTimeout(() => {
        document.getElementById(scrollTo)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      onNavigate?.(page);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-navy/95 backdrop-blur-sm border-b border-gold/20 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2.5 group"
          >
            <img
              src="/assets/rajat's eqn logo -1-1.jpeg"
              alt="Rajat's Equation"
              className="w-9 h-9 rounded-full object-cover border-2 border-gold/60 group-hover:border-gold transition-colors"
            />
            <span className="text-cream font-serif font-semibold text-lg hidden sm:block group-hover:text-gold transition-colors">
              Rajat's Equation
            </span>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNavClick(link.page, link.scrollTo)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentPage === link.page && !link.scrollTo
                    ? 'text-gold bg-gold/10'
                    : 'text-cream/70 hover:text-cream hover:bg-cream/10'
                }`}
              >
                {link.icon}
                {link.label}
              </button>
            ))}

            {/* Admin link — only for admin */}
            {isAuthenticated && isAdmin === true && (
              <button
                onClick={() => handleNavClick('admin')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentPage === 'admin'
                    ? 'text-gold bg-gold/10'
                    : 'text-gold/70 hover:text-gold hover:bg-gold/10'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                Admin
              </button>
            )}
          </nav>

          {/* Auth Button */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <Button
                onClick={handleLogout}
                size="sm"
                className="bg-cream/10 hover:bg-cream/20 text-cream border border-cream/20 hover:border-cream/40"
              >
                <LogOut className="w-4 h-4 mr-1.5" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            ) : (
              <Button
                onClick={handleLogin}
                disabled={isLoggingIn}
                size="sm"
                className="bg-gold hover:bg-gold/90 text-navy font-semibold"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                    <span className="hidden sm:inline">Logging in...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-1.5" />
                    <span className="hidden sm:inline">Login</span>
                  </>
                )}
              </Button>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-cream/70 hover:text-cream transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gold/20 py-3 space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNavClick(link.page, link.scrollTo)}
                className={`w-full flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-colors text-left ${
                  currentPage === link.page && !link.scrollTo
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
                className={`w-full flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-colors text-left ${
                  currentPage === 'admin'
                    ? 'text-gold bg-gold/10'
                    : 'text-gold/70 hover:text-gold hover:bg-gold/10'
                }`}
              >
                <Shield className="w-4 h-4" />
                Admin Dashboard
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
