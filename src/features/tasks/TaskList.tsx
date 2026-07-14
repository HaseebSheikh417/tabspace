import { useEffect } from 'react';
import { useTaskStore } from './task.store';
import { useWorkspaceStore } from '../workspace/workspace.store';
import type { Task } from './task.types';

function TaskItem({ task }: { task: Task }) {
  const toggleTask = useTaskStore((s) => s.toggleTask);
  const deleteTask = useTaskStore((s) => s.deleteTask);

  return (
    <li className={`task-item ${task.completed ? 'task-item--completed' : ''}`}>
      <button
        id={`task-toggle-${task.id}`}
        className="task-checkbox"
        onClick={() => toggleTask(task.id)}
        aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
        aria-pressed={task.completed}
      >
        {task.completed && (
          <svg className="task-check-icon" viewBox="0 0 12 12" fill="none">
            <path
              d="M2 6l3 3 5-5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

      <span className="task-title">{task.title}</span>

      <button
        id={`task-delete-${task.id}`}
        className="task-delete-btn"
        onClick={() => deleteTask(task.id)}
        aria-label="Delete task"
      >
        <svg viewBox="0 0 12 12" fill="none" width="12" height="12">
          <path
            d="M2 2l8 8M10 2l-8 8"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </li>
  );
}

export function TaskList() {
  const tasks = useTaskStore((s) => s.tasks);
  const loadTasks = useTaskStore((s) => s.loadTasks);
  const activeWorkspace = useWorkspaceStore((s) => s.activeWorkspace);

  // Reload tasks whenever the active workspace changes
  useEffect(() => {
    if (activeWorkspace) {
      loadTasks(activeWorkspace.id);
    }
  }, [activeWorkspace, loadTasks]);

  const pending = tasks.filter((t) => !t.completed);
  const completed = tasks.filter((t) => t.completed);

  if (tasks.length === 0) {
    return (
      <div className="task-empty-state">
        <div className="task-empty-icon">
          <svg viewBox="0 0 48 48" fill="none" width="48" height="48">
            <rect x="8" y="8" width="32" height="32" rx="6" stroke="currentColor" strokeWidth="2" />
            <path
              d="M16 24h16M16 18h8M16 30h12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <p className="task-empty-title">No tasks yet</p>
        <p className="task-empty-sub">Add your first task above to get started.</p>
      </div>
    );
  }

  return (
    <div className="task-list-wrapper">
      {pending.length > 0 && (
        <section className="task-section">
          <h3 className="task-section-label">
            Today <span className="task-count">{pending.length}</span>
          </h3>
          <ul className="task-list" role="list">
            {pending.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </ul>
        </section>
      )}

      {completed.length > 0 && (
        <section className="task-section task-section--completed">
          <h3 className="task-section-label task-section-label--muted">
            Done <span className="task-count">{completed.length}</span>
          </h3>
          <ul className="task-list" role="list">
            {completed.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
