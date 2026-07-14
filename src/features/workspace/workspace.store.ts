import { create } from 'zustand';
import { workspaceService } from './workspace.service';
import type { Workspace } from './workspace.types';

type WorkspaceStore = {
  // State
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  isBootstrapped: boolean;

  // Actions
  bootstrap: () => Promise<void>;
  loadWorkspaces: () => Promise<void>;
  createWorkspace: (name: string) => Promise<Workspace>;
  renameWorkspace: (id: string, name: string) => Promise<void>;
  deleteWorkspace: (id: string) => Promise<void>;
  switchWorkspace: (id: string) => Promise<void>;
};

export const useWorkspaceStore = create<WorkspaceStore>((set, get) => ({
  workspaces: [],
  activeWorkspace: null,
  isBootstrapped: false,

  bootstrap: async () => {
    // Ensure default workspace exists and legacy tasks are migrated
    await workspaceService.bootstrap();

    const workspaces = await workspaceService.getAll();
    const savedId = await workspaceService.getSelectedWorkspaceId();

    // Resolve active: saved → default → first available
    const active =
      workspaces.find((w) => w.id === savedId) ??
      workspaces.find((w) => w.isDefault) ??
      workspaces[0] ??
      null;

    set({ workspaces, activeWorkspace: active, isBootstrapped: true });
  },

  loadWorkspaces: async () => {
    const workspaces = await workspaceService.getAll();
    set({ workspaces });
  },

  createWorkspace: async (name: string) => {
    const workspace = await workspaceService.create(name);
    const workspaces = await workspaceService.getAll();
    set({ workspaces });
    // Auto-switch to the new workspace
    await get().switchWorkspace(workspace.id);
    return workspace;
  },

  renameWorkspace: async (id: string, name: string) => {
    await workspaceService.rename(id, name);
    const workspaces = await workspaceService.getAll();
    const { activeWorkspace } = get();
    const updatedActive = workspaces.find((w) => w.id === activeWorkspace?.id) ?? activeWorkspace;
    set({ workspaces, activeWorkspace: updatedActive });
  },

  deleteWorkspace: async (id: string) => {
    const { activeWorkspace, workspaces } = get();
    await workspaceService.delete(id);

    const updated = await workspaceService.getAll();

    // If the deleted workspace was active, fall back to default
    if (activeWorkspace?.id === id) {
      const fallback = updated.find((w) => w.isDefault) ?? updated[0];
      if (fallback) {
        await workspaceService.setSelectedWorkspaceId(fallback.id);
        set({ workspaces: updated, activeWorkspace: fallback });
      }
    } else {
      set({ workspaces: updated });
    }

    void workspaces; // suppress unused var lint
  },

  switchWorkspace: async (id: string) => {
    const { workspaces } = get();
    const workspace = workspaces.find((w) => w.id === id);
    if (!workspace) return;
    await workspaceService.setSelectedWorkspaceId(id);
    set({ activeWorkspace: workspace });
  },
}));
