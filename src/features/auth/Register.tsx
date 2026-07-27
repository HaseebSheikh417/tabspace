import { useState, useEffect, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

export function Register() {
  const navigate = useNavigate();
  const { register, isAuthenticated, error, clearError } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // If already authenticated, go home
  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated, navigate]);

  // Sync store-level errors into local state
  useEffect(() => {
    if (error) setLocalError(error);
  }, [error]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();
    setIsLoading(true);
    try {
      await register({ username: email, password, name: `${firstName} ${lastName}` });
      navigate('/', { replace: true });
    } catch {
      // error is already stored in authStore and reflected via localError sync
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid =
    firstName.trim() && lastName.trim() && email.trim() && password.trim();

  return (
    <div className="min-vh-100 d-flex flex-column bg-dark text-light align-items-center justify-content-center">
      <div className="card text-bg-dark border-secondary p-4 shadow" style={{ width: '100%', maxWidth: '420px' }}>
        <div className="card-body">
          <div className="text-center mb-4">
            <span
              className="d-inline-flex align-items-center justify-content-center mb-3"
              style={{ fontSize: '1.5rem', fontWeight: 'bold', width: '48px', height: '48px', backgroundColor: '#0d6efd', color: '#fff', borderRadius: '50%' }}
            >
              T
            </span>
            <h1 className="h4 card-title fw-bold mb-1">Create Account</h1>
            <p className="text-secondary small mb-0">Join Tabspace today</p>
          </div>

          {localError && (
            <div className="alert alert-danger py-2 small" role="alert">
              {localError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="row g-3 mb-3">
              <div className="col">
                <label htmlFor="register-first-name" className="form-label text-secondary fw-semibold">
                  First name
                </label>
                <input
                  id="register-first-name"
                  type="text"
                  className="form-control bg-dark text-light border-secondary shadow-none"
                  placeholder="Jane"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  autoComplete="given-name"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="col">
                <label htmlFor="register-last-name" className="form-label text-secondary fw-semibold">
                  Last name
                </label>
                <input
                  id="register-last-name"
                  type="text"
                  className="form-control bg-dark text-light border-secondary shadow-none"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  autoComplete="family-name"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="register-email" className="form-label text-secondary fw-semibold">
                Email address
              </label>
              <input
                id="register-email"
                type="email"
                className="form-control bg-dark text-light border-secondary shadow-none"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                disabled={isLoading}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="register-password" className="form-label text-secondary fw-semibold">
                Password
              </label>
              <input
                id="register-password"
                type="password"
                className="form-control bg-dark text-light border-secondary shadow-none"
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
                disabled={isLoading}
              />
            </div>

            <button
              id="register-submit-btn"
              type="submit"
              className="btn btn-primary w-100 mb-3 fw-bold"
              disabled={isLoading || !isFormValid}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                  Creating account…
                </>
              ) : (
                'Create Account'
              )}
            </button>

            <div className="text-center text-secondary small">
              Already have an account?{' '}
              <Link to="/login" className="text-decoration-none" onClick={clearError}>
                Sign in
              </Link>
              {' '}or{' '}
              <Link to="/" className="text-decoration-none" onClick={clearError}>
                Use as guest
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
