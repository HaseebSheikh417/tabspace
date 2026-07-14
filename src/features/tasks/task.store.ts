import { create } from 'zustand';
import { taskService } from './task.service';
import type { Task } from './task.types';

type TaskStore = {
  tasks: Task[];
  loadTasks: (workspaceId: string) => Promise<void>;
  addTask: (title: string, workspaceId: string) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
};

export const useTaskStore = create<TaskStore>((set) => ({
  tasks: [],

  loadTasks: async (workspaceId: string) => {
    const tasks = await taskService.getByWorkspace(workspaceId);
    set({ tasks });
  },

  addTask: async (title: string, workspaceId: string) => {
    if (!title.trim()) return;
    const task = await taskService.add(title, workspaceId);
    set((state) => ({ tasks: [task, ...state.tasks] }));
  },

  toggleTask: async (id: string) => {
    await taskService.toggle(id);
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id
          ? { ...t, completed: !t.completed, updatedAt: new Date().toISOString() }
          : t
      ),
    }));
  },

  deleteTask: async (id: string) => {
    await taskService.delete(id);
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));
  },
}));
