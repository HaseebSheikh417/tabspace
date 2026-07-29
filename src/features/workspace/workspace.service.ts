import { db } from '../../db';
import type { Workspace, AppSetting } from './workspace.types';
import { APP_SETTING_KEYS } from './workspace.types';

function generateId(): string {
  return crypto.randomUUID();
}

function now(): string {
  return new Date().toISOString();
}

export const workspaceService = {
  // ── Workspaces ──────────────────────────────────────────────────────

  async getAll(): Promise<Workspace[]> {
    return db.workspaces.orderBy('createdAt').toArray();
  },

  async getById(id: string): Promise<Workspace | undefined> {
    return db.workspaces.get(id);
  },

  async getDefault(): Promise<Workspace | undefined> {
    return db.workspaces.filter((w: Workspace) => w.isDefault).first();
  },

  async create(name: string, options?: { color?: string; icon?: string }): Promise<Workspace> {
    const trimmed = name.trim();
    if (trimmed.length < 2) throw new Error('Workspace name must be at least 2 characters.');
    if (trimmed.length > 50) throw new Error('Workspace name must be at most 50 characters.');

    // Case-insensitive duplicate check
    const all = await workspaceService.getAll();
    const duplicate = all.find((w) => w.name.toLowerCase() === trimmed.toLowerCase());
    if (duplicate) throw new Error(`A workspace named "${trimmed}" already exists.`);

    const workspace: Workspace = {
      id: generateId(),
      name: trimmed,
      isDefault: false,
      color: options?.color,
      icon: options?.icon,
      createdAt: now(),
      updatedAt: now(),
    };
    await db.workspaces.add(workspace);
    return workspace;
  },

  async createDefault(): Promise<Workspace> {
    const timestamp = now();
    const workspace: Workspace = {
      id: generateId(),
      name: 'Personal',
      isDefault: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    await db.workspaces.add(workspace);
    return workspace;
  },

  async rename(id: string, name: string): Promise<void> {
    const trimmed = name.trim();
    if (trimmed.length < 2) throw new Error('Workspace name must be at least 2 characters.');
    if (trimmed.length > 50) throw new Error('Workspace name must be at most 50 characters.');

    // Case-insensitive duplicate check (excluding self)
    const all = await workspaceService.getAll();
    const duplicate = all.find(
      (w) => w.id !== id && w.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (duplicate) throw new Error(`A workspace named "${trimmed}" already exists.`);

    await db.workspaces.update(id, { name: trimmed, updatedAt: now() });
  },

  async delete(id: string): Promise<void> {
    const workspace = await db.workspaces.get(id);
    if (!workspace) throw new Error('Workspace not found.');
    if (workspace.isDefault) throw new Error('The default workspace cannot be deleted.');

    // Delete all tasks and quick links belonging to this workspace
    await db.tasks.where('workspaceId').equals(id).delete();
    await db.quick_links.where('workspaceId').equals(id).delete();
    await db.workspaces.delete(id);
  },

  // ── App Settings ─────────────────────────────────────────────────────

  async getSetting(key: string): Promise<string | undefined> {
    const setting = await db.app_settings.get(key);
    return setting?.value;
  },

  async setSetting(key: string, value: string): Promise<void> {
    const setting: AppSetting = { key, value };
    await db.app_settings.put(setting);
  },

  async getSelectedWorkspaceId(): Promise<string | undefined> {
    return workspaceService.getSetting(APP_SETTING_KEYS.SELECTED_WORKSPACE_ID);
  },

  async setSelectedWorkspaceId(id: string): Promise<void> {
    return workspaceService.setSetting(APP_SETTING_KEYS.SELECTED_WORKSPACE_ID, id);
  },

  // ── Bootstrap ──────────────────────────────────────────────────────────
  // Called once on app init to ensure at least one workspace always exists
  // and to migrate legacy tasks to the default workspace.

  async bootstrap(): Promise<Workspace> {
    let defaultWorkspace = await workspaceService.getDefault();

    if (!defaultWorkspace) {
      defaultWorkspace = await workspaceService.createDefault();
    }

    // Re-home any legacy tasks that were tagged '__legacy__' by the DB migration
    await db.tasks
      .where('workspaceId')
      .equals('__legacy__')
      .modify({ workspaceId: defaultWorkspace.id });

    // Validate the persisted selected workspace still exists
    const savedId = await workspaceService.getSelectedWorkspaceId();
    if (savedId) {
      const exists = await db.workspaces.get(savedId);
      if (!exists) {
        await workspaceService.setSelectedWorkspaceId(defaultWorkspace.id);
      }
    } else {
      await workspaceService.setSelectedWorkspaceId(defaultWorkspace.id);
    }

    return defaultWorkspace;
  },
};
