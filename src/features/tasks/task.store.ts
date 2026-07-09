import { create } from 'zustand';
import { taskService } from './task.service';
import type { Task } from './task.types';

type TaskStore = {
  tasks: Task[];
  loadTasks: () => Promise<void>;
  addTask: (title: string) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
};

export const useTaskStore = create<TaskStore>((set) => ({
  tasks: [],

  loadTasks: async () => {
    const tasks = await taskService.getAll();
    set({ tasks });
  },

  addTask: async (title: string) => {
    if (!title.trim()) return;
    const task = await taskService.add(title);
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
