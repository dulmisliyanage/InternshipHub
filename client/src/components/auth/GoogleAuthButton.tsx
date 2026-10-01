import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { getDashboardPath } from '../../utils/navigation';
import { ApiError } from '../../services/auth.service';

export interface GoogleAuthButtonProps {
  text?: string;
  onError?: (errorMsg: string, isConflict?: boolean) => void;
}

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({
  text = 'Continue with Google',
  onError,
}) => {
  const navigate = useNavigate();
  const { googleLogin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showDevModal, setShowDevModal] = useState(false);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const handleCredential = async (credential: string) => {
    setIsLoading(true);
    try {
      const result = await googleLogin(credential);

      if (result.isNewUser) {
        // First-time Google user -> go to role selection
        navigate('/choose-account-type');
      } else if (result.user) {
        // Returning Google user -> directly enter their dashboard
        navigate(getDashboardPath(result.user.role), { replace: true });
      }
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 409) {
        // Step 9: Existing LOCAL email conflict handling
        const conflictMsg =
          'An account with this email already exists. Please sign in using your email and password.';
        onError?.(conflictMsg, true);
      } else {
        const msg = err instanceof Error ? err.message : 'Google authentication failed';
        onError?.(msg, false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLiveGoogleSuccess = (res: CredentialResponse) => {
    if (res.credential) {
      handleCredential(res.credential);
    } else {
      onError?.('No credential returned from Google', false);
    }
  };

  const handleLiveGoogleError = () => {
    onError?.('Google Sign-In was cancelled or failed.', false);
  };

  // Development/Testing fallback when VITE_GOOGLE_CLIENT_ID is not configured yet
  const handleDevSimulate = (scenario: 'new_student' | 'new_company' | 'returning' | 'conflict') => {
    setShowDevModal(false);
    const ts = Date.now();

    let devPayload: { googleId: string; email: string; name: string; picture?: string };

    switch (scenario) {
      case 'new_student':
        devPayload = {
          googleId: `google_student_${ts}`,
          email: `google_student_${ts}@example.com`,
          name: 'Sarah Googler',
          picture: 'https://lh3.googleusercontent.com/a/student-avatar',
        };
        break;
      case 'new_company':
        devPayload = {
          googleId: `google_company_${ts}`,
          email: `google_company_${ts}@example.com`,
          name: 'Acme Google Partner',
          picture: 'https://lh3.googleusercontent.com/a/company-avatar',
        };
        break;
      case 'returning':
        // Uses returning mock ID
        devPayload = {
          googleId: `google_returning_demo`,
          email: `google_returning_demo@example.com`,
          name: 'Alex Returning Google User',
        };
        break;
      case 'conflict':
        // Triggers 409 email conflict if local user exists
        devPayload = {
          googleId: `google_conflict_${ts}`,
          email: `sarah@example.com`, // matches existing local demo user
          name: 'Conflict Profile',
        };
        break;
    }

    const mockToken = `mock_google_:${btoa(JSON.stringify(devPayload))}`;
    handleCredential(mockToken);
  };

  return (
    <div style={{ width: '100%' }}>
      {googleClientId ? (
        <GoogleOAuthProvider clientId={googleClientId}>
          <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <GoogleLogin
              onSuccess={handleLiveGoogleSuccess}
              onError={handleLiveGoogleError}
              text="continue_with"
              shape="rectangular"
              theme="outline"
              size="large"
              width="100%"
            />
          </div>
        </GoogleOAuthProvider>
      ) : (
        <>
          <Button
            type="button"
            variant="google"
            fullWidth
            size="lg"
            isLoading={isLoading}
            onClick={() => setShowDevModal(true)}
            aria-label={text}
          >
            {text}
          </Button>

          {/* Development Helper Modal for instant testing without Google Console setup */}
          {showDevModal && (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(15, 23, 42, 0.65)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
                padding: '1rem',
              }}
              onClick={() => setShowDevModal(false)}
            >
              <div
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '2rem',
                  maxWidth: '460px',
                  width: '100%',
                  boxShadow: 'var(--shadow-xl)',
                  border: '1px solid var(--color-border)',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>⚡</span>
                  <h3 className="section-heading" style={{ margin: 0, fontSize: '1.25rem' }}>
                    Google Sign-In Simulation
                  </h3>
                </div>

                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                  <code>VITE_GOOGLE_CLIENT_ID</code> is not yet configured in <code>client/.env</code>. Choose a scenario to test the Google authentication flow:
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  <Button
                    variant="outline"
                    size="md"
                    fullWidth
                    onClick={() => handleDevSimulate('new_student')}
                    style={{ textAlign: 'left', justifyContent: 'flex-start' }}
                  >
                    🎓 Test First-Time Google User ➔ /choose-account-type
                  </Button>

                  <Button
                    variant="secondary"
                    size="md"
                    fullWidth
                    onClick={() => handleDevSimulate('conflict')}
                    style={{ textAlign: 'left', justifyContent: 'flex-start' }}
                  >
                    ⚠️ Test Local Email Conflict ➔ 409 Notice
                  </Button>
                </div>

                <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
                  <Button variant="ghost" size="sm" onClick={() => setShowDevModal(false)}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default GoogleAuthButton;
