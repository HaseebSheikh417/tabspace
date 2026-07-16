import { useEffect } from 'react';
import { useTaskStore } from './task.store';
import { useWorkspaceStore } from '../workspace/workspace.store';
import type { Task } from './task.types';

function TaskItem({ task }: { task: Task }) {
  const toggleTask = useTaskStore((s) => s.toggleTask);
  const deleteTask = useTaskStore((s) => s.deleteTask);

  return (
    <li className={`list-group-item bg-dark text-light border-secondary d-flex justify-content-between align-items-center ${task.completed ? 'opacity-50' : ''}`}>
      <div className="d-flex align-items-center gap-3 flex-grow-1">
        <input 
          className="form-check-input mt-0 bg-dark border-secondary" 
          type="checkbox" 
          checked={task.completed}
          onChange={() => toggleTask(task.id)}
          aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
        />
        <span className={task.completed ? 'text-decoration-line-through text-secondary' : ''}>
          {task.title}
        </span>
      </div>

      <button
        id={`task-delete-${task.id}`}
        className="btn btn-sm btn-outline-danger border-0 d-flex align-items-center justify-content-center p-1"
        onClick={() => deleteTask(task.id)}
        aria-label="Delete task"
      >
        <svg viewBox="0 0 12 12" fill="none" width="12" height="12">
          <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
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
      <div className="d-flex flex-column align-items-center justify-content-center p-5 text-center border border-secondary border-dashed rounded bg-dark">
        <div className="text-secondary opacity-50 mb-3">
          <svg viewBox="0 0 48 48" fill="none" width="48" height="48">
            <rect x="8" y="8" width="32" height="32" rx="6" stroke="currentColor" strokeWidth="2" />
            <path d="M16 24h16M16 18h8M16 30h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <p className="fw-semibold text-light mb-1">No tasks yet</p>
        <p className="small text-secondary mb-0">Add your first task above to get started.</p>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column gap-4">
      {pending.length > 0 && (
        <section>
          <h3 className="fs-6 fw-bold text-uppercase text-secondary mb-2 d-flex align-items-center gap-2">
            Today <span className="badge bg-secondary rounded-pill">{pending.length}</span>
          </h3>
          <ul className="list-group list-group-flush border-top border-bottom border-secondary" role="list">
            {pending.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </ul>
        </section>
      )}

      {completed.length > 0 && (
        <section>
          <h3 className="fs-6 fw-bold text-uppercase text-secondary mb-2 d-flex align-items-center gap-2 opacity-75">
            Done <span className="badge bg-secondary rounded-pill">{completed.length}</span>
          </h3>
          <ul className="list-group list-group-flush border-top border-bottom border-secondary" role="list">
            {completed.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
