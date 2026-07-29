import { create } from 'zustand';
import { quickLinkService } from './quicklink.service';
import type { QuickLink } from './quicklink.types';

type QuickLinkStore = {
  links: QuickLink[];
  isLoading: boolean;

  loadLinks: (workspaceId: string) => Promise<void>;
  addLink: (url: string, workspaceId: string) => Promise<QuickLink>;
  updateLink: (id: string, patch: { name?: string; url?: string }) => Promise<void>;
  deleteLink: (id: string) => Promise<void>;
  reorderLinks: (links: QuickLink[]) => Promise<void>;
};

export const useQuickLinkStore = create<QuickLinkStore>((set, get) => ({
  links: [],
  isLoading: false,

  loadLinks: async (workspaceId: string) => {
    set({ isLoading: true });
    try {
      const links = await quickLinkService.getByWorkspace(workspaceId);
      set({ links });
    } finally {
      set({ isLoading: false });
    }
  },

  addLink: async (url: string, workspaceId: string) => {
    const link = await quickLinkService.add(url, workspaceId);
    set((state) => ({ links: [...state.links, link] }));
    return link;
  },

  updateLink: async (id: string, patch: { name?: string; url?: string }) => {
    await quickLinkService.update(id, patch);
    // Reload to pick up updated fields (favicon, domain, etc.)
    const { links } = get();
    const workspaceId = links.find((l) => l.id === id)?.workspaceId;
    if (workspaceId) {
      const fresh = await quickLinkService.getByWorkspace(workspaceId);
      set({ links: fresh });
    }
  },

  deleteLink: async (id: string) => {
    await quickLinkService.delete(id);
    set((state) => ({ links: state.links.filter((l) => l.id !== id) }));
  },

  reorderLinks: async (links: QuickLink[]) => {
    // Optimistic update for instant UI feedback
    set({ links });
    await quickLinkService.reorderAll(links);
  },
}));
