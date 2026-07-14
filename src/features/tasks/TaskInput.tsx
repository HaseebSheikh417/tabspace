import { useState, type FormEvent } from 'react';
import { useTaskStore } from './task.store';
import { useWorkspaceStore } from '../workspace/workspace.store';

export function TaskInput() {
  const [value, setValue] = useState('');
  const addTask = useTaskStore((s) => s.addTask);
  const activeWorkspace = useWorkspaceStore((s) => s.activeWorkspace);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || !activeWorkspace) return;
    await addTask(trimmed, activeWorkspace.id);
    setValue('');
  };

  return (
    <form className="task-input-form" onSubmit={handleSubmit}>
      <div className="task-input-wrapper">
        <span className="task-input-icon">+</span>
        <input
          id="task-input"
          className="task-input"
          type="text"
          placeholder="Add a task and press Enter..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoComplete="off"
          autoFocus
        />
        <button
          id="task-submit-btn"
          className="task-submit-btn"
          type="submit"
          disabled={!value.trim()}
          aria-label="Add task"
        >
          Add
        </button>
      </div>
    </form>
  );
}
