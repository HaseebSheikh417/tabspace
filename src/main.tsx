import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { createHashRouter, RouterProvider, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './styles/global.css';
import { App } from './app/App';
import { Login } from './features/auth/Login';
import { Register } from './features/auth/Register';
import { useAuth } from './features/auth/hooks/useAuth';
import { AuthStatus } from './features/auth/types/auth.enums';
import { useTaskStore } from './features/tasks/task.store';

/**
 * AuthGate — runs once on app mount to restore the session from persisted
 * tokens (chrome.storage.local / localStorage).  Also clears task state
 * whenever the user logs out so no stale data bleeds across sessions.
 */
function AuthGate({ children }: { children: React.ReactNode }) {
  const { initialize, isInitialized, status } = useAuth();
  const loadTasks = useTaskStore((s) => s.loadTasks);

  // Bootstrap auth exactly once
  useEffect(() => {
    initialize();
  }, [initialize]);

  // When status flips to UNAUTHENTICATED *after* auth has fully initialised,
  // clear the in-memory task list so no stale data bleeds across sessions.
  // The isInitialized guard is critical: without it this effect can fire while
  // initialize() is still in-flight (status still UNAUTHENTICATED from its
  // initial value), wiping tasks that were just loaded by the workspace bootstrap.
  useEffect(() => {
    if (isInitialized && status === AuthStatus.UNAUTHENTICATED) {
      loadTasks('__none__');
    }
  }, [isInitialized, status, loadTasks]);

  // Show nothing while we're determining the auth state
  if (!isInitialized) return null;

  return <>{children}</>;
}

/**
 * GuestRedirect — if the user navigates to /login or /register while already
 * authenticated, send them home.
 */
function GuestRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
}

const router = createHashRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/login',
    element: (
      <GuestRoute>
        <Login />
      </GuestRoute>
    ),
  },
  {
    path: '/register',
    element: (
      <GuestRoute>
        <Register />
      </GuestRoute>
    ),
  },
]);

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Root element not found');

createRoot(rootEl).render(
  <StrictMode>
    <AuthGate>
      <RouterProvider router={router} />
    </AuthGate>
  </StrictMode>
);
