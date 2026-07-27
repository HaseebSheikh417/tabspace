import { useState, useEffect } from 'react';
import { TaskInput } from '../features/tasks/TaskInput';
import { TaskList } from '../features/tasks/TaskList';
import { useWorkspaceStore } from '../features/workspace/workspace.store';
import { WorkspaceSwitcher } from '../features/workspace/WorkspaceSwitcher';
import { Link } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';


function getFormattedTime(): string {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function getTodayShort(): string {
  return new Date().toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function App() {
  const [, setTime] = useState(getFormattedTime);
  const bootstrap = useWorkspaceStore((s) => s.bootstrap);
  const isBootstrapped = useWorkspaceStore((s) => s.isBootstrapped);
  const activeWorkspace = useWorkspaceStore((state) => state.activeWorkspace);

  const { isAuthenticated, user, logout } = useAuth();

  const activeWorkspaceColor = activeWorkspace?.color ?? '#000';

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    const id = setInterval(() => setTime(getFormattedTime()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!isBootstrapped) return null;

  return (
    <div className="min-vh-100 d-flex flex-column bg-dark text-light">
      {/* ── Header ─────────────────────────── */}
      <nav className="navbar navbar-expand-lg bg-body-tertiary border-bottom border-secondary px-3">
        <div className="container-fluid">
          <a className="navbar-brand d-flex align-items-center fw-bold" href="#">
            <span
              className="me-2 d-flex align-items-center justify-content-center"
              style={{ fontSize: '1rem', width: '24px', height: '24px', backgroundColor: activeWorkspaceColor, color: '#fff', borderRadius: '50%' }}
            >
              T
            </span>
            Tabspace
          </a>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon" />
          </button>

          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <WorkspaceSwitcher />
              </li>
            </ul>

            <div className="d-flex align-items-center gap-2">
              {isAuthenticated ? (
                <>
                  {user && (
                    <span className="text-secondary small me-1">
                      {user.name}
                    </span>
                  )}
                  <button
                    id="logout-btn"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => logout()}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn btn-outline-primary btn-sm">
                    Login
                  </Link>
                  <Link to="/register" className="btn btn-primary btn-sm">
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ── Main ───────────────────────────── */}
      <main className="container py-5 flex-grow-1" id="main-content">
        <div className="row justify-content-center">
          <div className="col-lg-8 col-xl-6">
            {/* Task column */}
            <section aria-label="Today's tasks">
              <div className="d-flex align-items-center justify-content-between mb-4">
                <h2 className="fs-4 fw-semibold mb-0 d-flex align-items-center gap-2">
                  <span className="badge bg-primary rounded-1">✓</span>
                  Tasks
                </h2>
                <span className="text-secondary small">{getTodayShort()}</span>
              </div>

              <TaskInput />
              <div className="mt-4">
                <TaskList />
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
