import Dexie from 'dexie';

import type { Task } from '../features/tasks/task.types';
import type {
  Workspace,
  AppSetting,
} from '../features/workspace/workspace.types';

export type TabspaceDatabase = Dexie & {
  tasks: Dexie.Table<Task, string>;
  workspaces: Dexie.Table<Workspace, string>;
  app_settings: Dexie.Table<AppSetting, string>;
};

export const db = new Dexie('tabspace_db') as TabspaceDatabase;

db.version(1).stores({
  tasks: 'id, completed, createdAt, updatedAt',
});

db.version(2)
  .stores({
    tasks: 'id, workspaceId, completed, createdAt, updatedAt',
    workspaces: 'id, isDefault, createdAt',
    app_settings: 'key',
  })
  .upgrade(async (tx: Dexie.Transaction) => {
    await tx.table('tasks').toCollection().modify((task: any) => {
      if (!task.workspaceId) {
        task.workspaceId = '__legacy__';
      }
    });
  });