import { LogIn, X, Shield } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from './ui/dialog';
import { Button } from './ui/button';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
}

export function LoginModal({ open, onClose }: LoginModalProps) {
  const { login, loginStatus } = useInternetIdentity();
  const isLoggingIn = loginStatus === 'logging-in';

  const handleLogin = async () => {
    try {
      await login();
      onClose();
    } catch (error: any) {
      console.error('Login error:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent className="sm:max-w-md border-2 border-border-warm bg-cream">
        <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
          <X className="h-4 w-4 text-navy" />
          <span className="sr-only">Close</span>
        </DialogClose>

        <DialogHeader className="text-center items-center pt-4">
          <div className="w-16 h-16 rounded-full bg-navy/10 flex items-center justify-center mb-4 mx-auto">
            <Shield className="w-8 h-8 text-navy" />
          </div>
          <DialogTitle className="text-2xl font-bold text-navy font-serif">
            Login Required
          </DialogTitle>
          <DialogDescription className="text-warm-text text-base mt-2 text-center">
            Please sign in to access this feature. Login is quick and secure using Internet Identity — supporting passkeys, Google, Apple, or Microsoft sign-in.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 mt-6 pb-2">
          <Button
            size="lg"
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="w-full bg-navy hover:bg-navy/90 text-white font-semibold py-6 text-base shadow-lg"
          >
            {isLoggingIn ? (
              <>
                <span className="animate-spin mr-2 inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                Signing in…
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5 mr-2" />
                Sign In with Internet Identity
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            size="lg"
            onClick={onClose}
            disabled={isLoggingIn}
            className="w-full text-warm-text hover:text-navy"
          >
            Continue Browsing
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
