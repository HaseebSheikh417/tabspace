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
    <form onSubmit={handleSubmit}>
      <div className="input-group">
        <span className="input-group-text bg-dark text-secondary border-secondary border-end-0 bg-transparent px-3">+</span>
        <input
          id="task-input"
          className="form-control bg-dark text-light border-secondary border-start-0 shadow-none ps-0"
          type="text"
          placeholder="Add a task and press Enter..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoComplete="off"
          autoFocus
        />
        <button
          id="task-submit-btn"
          className="btn btn-primary px-4"
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
