import { db } from '../../db';
import type { QuickLink } from './quicklink.types';

// ── Helpers ──────────────────────────────────────────────────────────────────

function generateId(): string {
  return crypto.randomUUID();
}

function now(): string {
  return new Date().toISOString();
}

/** Accepted URL schemes (PRD §18) */
const ALLOWED_SCHEMES = ['http:', 'https:'];

export function validateUrl(raw: string): URL {
  let url: URL;
  try {
    // Prepend https if no scheme supplied
    url = new URL(raw.includes('://') ? raw : `https://${raw}`);
  } catch {
    throw new Error('Invalid URL. Please enter a valid web address.');
  }

  if (!ALLOWED_SCHEMES.includes(url.protocol)) {
    throw new Error(`Unsupported URL scheme "${url.protocol}". Only http and https are allowed.`);
  }

  return url;
}

/** Extract domain from URL string */
function extractDomain(url: URL): string {
  return url.hostname.replace(/^www\./, '');
}

/**
 * Best-effort favicon URL using Google's reliable favicon service.
 * Falls back to an empty string so the UI can render a letter avatar.
 */
function buildFaviconUrl(url: URL): string {
  return `https://www.google.com/s2/favicons?sz=32&domain=${url.hostname}`;
}

/**
 * Attempt to resolve the page title by fetching the page via a CORS proxy.
 * This is a best-effort operation — on failure the domain name is used.
 */
async function fetchPageTitle(url: URL): Promise<string> {
  // Derive a clean human-readable fallback from the domain
  const domainFallback = extractDomain(url)
    .split('.')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ');

  try {
    // allorigins is a free CORS proxy that returns the HTML body
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url.href)}`;
    const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return domainFallback;

    const json: { contents?: string } = await res.json();
    const html = json.contents ?? '';

    const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (match?.[1]) {
      return match[1].trim().slice(0, 64); // cap length
    }
  } catch {
    // Network failure, timeout, etc. — silently fall back
  }

  return domainFallback;
}

// ── Service ──────────────────────────────────────────────────────────────────

export const quickLinkService = {
  /** Return all links for a workspace ordered by displayOrder ascending */
  async getByWorkspace(workspaceId: string): Promise<QuickLink[]> {
    return db.quick_links
      .where('workspaceId')
      .equals(workspaceId)
      .sortBy('displayOrder');
  },

  /**
   * Create a new quick link.
   * Automatically resolves name, domain, and favicon from the URL.
   */
  async add(rawUrl: string, workspaceId: string): Promise<QuickLink> {
    const url = validateUrl(rawUrl);
    const domain = extractDomain(url);
    const favicon = buildFaviconUrl(url);

    // Resolve name asynchronously; falls back to domain on failure
    const name = await fetchPageTitle(url);

    // Place new link at the end
    const existing = await quickLinkService.getByWorkspace(workspaceId);
    const displayOrder = existing.length > 0
      ? Math.max(...existing.map((l) => l.displayOrder)) + 1
      : 0;

    const timestamp = now();
    const link: QuickLink = {
      id: generateId(),
      workspaceId,
      name,
      url: url.href,
      domain,
      favicon,
      displayOrder,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await db.quick_links.add(link);
    return link;
  },

  /** Update name and/or URL */
  async update(id: string, patch: { name?: string; url?: string }): Promise<void> {
    const updates: Partial<QuickLink> = { updatedAt: now() };

    if (patch.name !== undefined) {
      const name = patch.name.trim();
      if (!name) throw new Error('Name cannot be empty.');
      updates.name = name;
    }

    if (patch.url !== undefined) {
      const url = validateUrl(patch.url);
      updates.url = url.href;
      updates.domain = extractDomain(url);
      updates.favicon = buildFaviconUrl(url);
    }

    await db.quick_links.update(id, updates);
  },

  /** Persist a new displayOrder for the given link */
  async reorder(id: string, displayOrder: number): Promise<void> {
    await db.quick_links.update(id, { displayOrder, updatedAt: now() });
  },

  /**
   * Persist a full re-ordered list by writing each item's displayOrder
   * in a single IndexedDB transaction (best-effort).
   */
  async reorderAll(links: QuickLink[]): Promise<void> {
    await db.transaction('rw', db.quick_links, async () => {
      for (let i = 0; i < links.length; i++) {
        await db.quick_links.update(links[i].id, { displayOrder: i, updatedAt: now() });
      }
    });
  },

  /** Delete a single quick link */
  async delete(id: string): Promise<void> {
    await db.quick_links.delete(id);
  },

  /** Delete all quick links belonging to a workspace */
  async deleteByWorkspace(workspaceId: string): Promise<void> {
    await db.quick_links.where('workspaceId').equals(workspaceId).delete();
  },
};
