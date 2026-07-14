import { useState, useEffect } from 'react';
import { TaskInput } from '../features/tasks/TaskInput';
import { TaskList } from '../features/tasks/TaskList';
import { useWorkspaceStore } from '../features/workspace/workspace.store';
import { WorkspaceSwitcher } from '../features/workspace/WorkspaceSwitcher';

// function getGreeting(): string {
//   const h = new Date().getHours();
//   if (h < 12) return 'Good morning';
//   if (h < 18) return 'Good afternoon';
//   return 'Good evening';
// }

function getFormattedTime(): string {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// function getFormattedDate(): string {
//   return new Date().toLocaleDateString([], {
//     weekday: 'long',
//     month: 'long',
//     day: 'numeric',
//   });
// }

function getTodayShort(): string {
  return new Date().toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function App() {
  const [time, setTime] = useState(getFormattedTime);
  const bootstrap = useWorkspaceStore((s) => s.bootstrap);
  const isBootstrapped = useWorkspaceStore((s) => s.isBootstrapped);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    const id = setInterval(() => setTime(getFormattedTime()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!isBootstrapped) return null;

  return (
    <div className="app">
      {/* ── Header ─────────────────────────── */}
      <header className="app-header">
        <div className="app-brand">
          <div className="app-logo" aria-hidden="true">T</div>
          <div>
            <h1 className="app-name">Tabspace</h1>
          </div>
          <WorkspaceSwitcher />
        </div>

        <div className="app-header-right">
          <span className="app-time" aria-live="polite" aria-label="Current time">{time}</span>
        </div>
      </header>

      {/* ── Main ───────────────────────────── */}
      <main className="app-main" id="main-content">
        {/* Workspace column */}
        {/* <section className="workspace-panel" aria-label="Workspace">
          <div className="workspace-greeting">
            <p className="workspace-greeting-time">{getFormattedDate()}</p>
            <p className="workspace-greeting-title">
              <span>{getGreeting()}</span> — let's get to work.
            </p>
          </div> */}

        {/* Workspace placeholder */}
        {/* <div
            className="workspace-placeholder"
            role="region"
            aria-label="Workspace canvas (coming soon)"

          >
            <div className="workspace-placeholder-icon">
              <svg viewBox="0 0 64 64" fill="none" width="56" height="56">
                <rect x="4" y="10" width="56" height="40" rx="6" stroke="currentColor" strokeWidth="2" />
                <rect x="12" y="18" width="18" height="14" rx="3" stroke="currentColor" strokeWidth="1.5" />
                <rect x="12" y="36" width="40" height="4" rx="2" fill="currentColor" opacity="0.2" />
                <rect x="34" y="18" width="18" height="6" rx="2" fill="currentColor" opacity="0.2" />
                <rect x="34" y="28" width="12" height="4" rx="2" fill="currentColor" opacity="0.15" />
              </svg>
            </div>
            <p className="workspace-placeholder-title">Workspace</p>
            <p className="workspace-placeholder-sub">
              Your workspace canvas will appear here. Modules, notes, and context coming in future releases.
            </p>
            <span className="workspace-placeholder-badge">
              <svg viewBox="0 0 8 8" fill="currentColor" width="6" height="6">
                <circle cx="4" cy="4" r="4" />
              </svg>
              Coming in PRD 02
            </span>
          </div> */}
        {/* </section> */}

        {/* Task column */}
        <section className="task-panel" aria-label="Today's tasks">
          <div className="task-panel-header">
            <h2 className="task-panel-title">
              <span className="task-panel-title-icon">✓</span>
              Tasks
            </h2>
            <span className="task-panel-date">{getTodayShort()}</span>
          </div>

          <TaskInput />
          <TaskList />
        </section>
      </main>
    </div>
  );
}
