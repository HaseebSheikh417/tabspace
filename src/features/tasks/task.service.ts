import { db } from '../../db';
import type { Task } from './task.types';

function generateId(): string {
  return crypto.randomUUID();
}

function now(): string {
  return new Date().toISOString();
}

export const taskService = {
  async getByWorkspace(workspaceId: string): Promise<Task[]> {
    return db.tasks
      .where('workspaceId')
      .equals(workspaceId)
      .reverse()
      .sortBy('createdAt');
  },

  async add(title: string, workspaceId: string): Promise<Task> {
    const timestamp = now();
    const task: Task = {
      id: generateId(),
      workspaceId,
      title: title.trim(),
      completed: false,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    await db.tasks.add(task);
    return task;
  },

  async toggle(id: string): Promise<void> {
    const task = await db.tasks.get(id);
    if (!task) return;
    await db.tasks.update(id, {
      completed: !task.completed,
      updatedAt: now(),
    });
  },

  async delete(id: string): Promise<void> {
    await db.tasks.delete(id);
  },
};
