import { useState, useEffect, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

export function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated, error, clearError } = useAuth();

  const [username, setUsername] = useState('');
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
      await login({ username, password });
      navigate('/', { replace: true });
    } catch {
      // error is already stored in authStore and reflected via localError sync
    } finally {
      setIsLoading(false);
    }
  };

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
            <h1 className="h4 card-title fw-bold mb-1">Sign In</h1>
            <p className="text-secondary small mb-0">Welcome back to Tabspace</p>
          </div>

          {localError && (
            <div className="alert alert-danger py-2 small" role="alert">
              {localError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-3">
              <label htmlFor="login-email" className="form-label text-secondary fw-semibold">
                Email address
              </label>
              <input
                id="login-email"
                type="email"
                className="form-control bg-dark text-light border-secondary shadow-none"
                placeholder="you@example.com"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
                disabled={isLoading}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="login-password" className="form-label text-secondary fw-semibold">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                className="form-control bg-dark text-light border-secondary shadow-none"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                disabled={isLoading}
              />
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              className="btn btn-primary w-100 mb-3 fw-bold"
              disabled={isLoading || !username.trim() || !password.trim()}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                  Signing in…
                </>
              ) : (
                'Sign In'
              )}
            </button>

            <div className="text-center text-secondary small">
              Don't have an account?{' '}
              <Link to="/register" className="text-decoration-none" onClick={clearError}>
                Create one
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
