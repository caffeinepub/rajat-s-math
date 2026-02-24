import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { LoginModal } from './LoginModal';

interface AuthGateProps {
  children: React.ReactNode;
  /** Called when the user is authenticated and clicks the wrapped element */
  onAction?: () => void;
  /** If true, wraps children in a div that intercepts clicks */
  asWrapper?: boolean;
}

/**
 * AuthGate wraps interactive elements and enforces authentication.
 * - If the user is authenticated, clicks pass through normally (onAction is called).
 * - If the user is NOT authenticated, a login modal is shown instead.
 *
 * Usage (intercept mode — wraps an anchor/button):
 *   <AuthGate onAction={() => window.open(url)}>
 *     <button>Click me</button>
 *   </AuthGate>
 *
 * Usage (wrapper mode — wraps a block):
 *   <AuthGate asWrapper onAction={handleAction}>
 *     <a href="...">Link</a>
 *   </AuthGate>
 */
export function AuthGate({ children, onAction, asWrapper = false }: AuthGateProps) {
  const { identity } = useInternetIdentity();
  const [showModal, setShowModal] = useState(false);

  const isAuthenticated = !!identity;

  const handleClick = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault();
      e.stopPropagation();
      setShowModal(true);
    } else if (onAction) {
      e.preventDefault();
      e.stopPropagation();
      onAction();
    }
    // If authenticated and no onAction, let the event bubble naturally
  };

  return (
    <>
      <div
        onClick={handleClick}
        className={asWrapper ? 'contents' : 'contents'}
        style={{ display: 'contents' }}
      >
        {children}
      </div>
      <LoginModal open={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}
