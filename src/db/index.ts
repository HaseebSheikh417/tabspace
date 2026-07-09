import Dexie, { type Table } from 'dexie';
import type { Task } from '../features/tasks/task.types';

class TabspaceDatabase extends Dexie {
  tasks!: Table<Task, string>;

  constructor() {
    super('tabspace_db');

    this.version(1).stores({
      tasks: 'id, completed, createdAt, updatedAt',
    });
  }
}

export const db = new TabspaceDatabase();
