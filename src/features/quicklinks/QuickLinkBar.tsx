import { useEffect, useRef, useState } from 'react';
import { useQuickLinkStore } from './quicklink.store';
import { useWorkspaceStore } from '../workspace/workspace.store';
import { AddQuickLinkModal } from './AddQuickLinkModal';
import { QuickLinkManager } from './QuickLinkManager';
import type { QuickLink } from './quicklink.types';

// Number of visible links before overflow kicks in
const MAX_VISIBLE = 14;

// ── Favicon renderer ──────────────────────────────────────────────────────────
function LinkFavicon({ link }: { link: QuickLink }) {
  const [broken, setBroken] = useState(false);

  if (link.favicon && !broken) {
    return (
      <img
        src={link.favicon}
        alt=""
        width={14}
        height={14}
        className="flex-shrink-0"
        style={{ borderRadius: 2 }}
        onError={() => setBroken(true)}
      />
    );
  }
  // Letter avatar fallback
  return (
    <span
      className="d-inline-flex align-items-center justify-content-center flex-shrink-0"
      style={{
        width: 14,
        height: 14,
        background: 'rgba(255,255,255,0.15)',
        borderRadius: 3,
        fontSize: 8,
        fontWeight: 700,
        color: '#fff',
      }}
    >
      {link.name.charAt(0).toUpperCase()}
    </span>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function QuickLinkBar() {
  const { links, loadLinks, addLink, updateLink, deleteLink, reorderLinks } = useQuickLinkStore();
  const activeWorkspace = useWorkspaceStore((s) => s.activeWorkspace);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showManager, setShowManager] = useState(false);
  const [showOverflow, setShowOverflow] = useState(false);
  const overflowRef = useRef<HTMLDivElement>(null);

  // Load links whenever the active workspace changes
  useEffect(() => {
    if (activeWorkspace?.id) {
      loadLinks(activeWorkspace.id);
    }
  }, [activeWorkspace?.id, loadLinks]);

  // Close overflow dropdown on outside click
  useEffect(() => {
    if (!showOverflow) return;
    const handle = (e: MouseEvent) => {
      if (overflowRef.current && !overflowRef.current.contains(e.target as Node)) {
        setShowOverflow(false);
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [showOverflow]);

  const visible = links.slice(0, MAX_VISIBLE);
  const overflow = links.slice(MAX_VISIBLE);

  const handleAdd = async (url: string) => {
    if (!activeWorkspace?.id) throw new Error('No active workspace.');
    await addLink(url, activeWorkspace.id);
  };

  const openLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      {/* ── Bar ──────────────────────────────────────────────────────── */}
      <div
        id="quick-link-bar"
        className="quick-link-bar d-flex align-items-center gap-1 px-3 border-bottom border-secondary"
        style={{
          height: 36,
          background: 'rgba(255,255,255,0.03)',
          whiteSpace: 'nowrap',
        }}
      >
        {/* Visible links */}
        {visible.map((link) => (
          <button
            key={link.id}
            className="ql-chip btn btn-sm d-inline-flex align-items-center gap-1 px-2 py-1 rounded-2 text-light border-0"
            style={{
              background: 'transparent',
              fontSize: '0.78rem',
              transition: 'background 0.15s',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            onClick={() => openLink(link.url)}
            title={link.url}
          >
            <LinkFavicon link={link} />
            <span title={link.name}>{link.name.length > 15 ? link.name.slice(0, 15) + '...' : link.name}</span>
          </button>
        ))}

        {/* Overflow pill */}
        {overflow.length > 0 && (
          <div className="position-relative" ref={overflowRef}>
            <button
              id="ql-overflow-btn"
              className="btn btn-sm px-2 py-1 rounded-2 text-secondary border-0"
              style={{ fontSize: '0.78rem', background: 'transparent' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              onClick={() => setShowOverflow((v) => !v)}
            >
              +{overflow.length}
            </button>

            {showOverflow && (
              <div
                className="dropdown-menu dropdown-menu-dark show shadow"
                style={{ minWidth: 200, top: '100%', left: 0 }}
              >
                {overflow.map((link) => (
                  <button
                    key={link.id}
                    className="dropdown-item d-flex align-items-center gap-2"
                    style={{ fontSize: '0.85rem' }}
                    onClick={() => { openLink(link.url); setShowOverflow(false); }}
                  >
                    <LinkFavicon link={link} />
                    <span className="text-truncate">{link.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Spacer */}
        <div className="flex-grow-1" />

        {/* Manage button — subtle gear icon */}
        <button
          id="ql-manage-btn"
          className="btn btn-sm border-0 text-secondary p-1"
          style={{ fontSize: '0.78rem', background: 'transparent', transition: 'color 0.15s' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '')}
          onClick={() => setShowManager(true)}
          title="Manage quick links"
          aria-label="Manage quick links"
        >
          <i className="bi bi-sliders" />
        </button>

        {/* Add button: make icon visible and larger */}
        <button
          id="ql-add-btn"
          className="btn btn-sm border-0 text-secondary p-1"
          style={{ fontSize: '0.78rem', background: 'transparent', transition: 'color 0.15s' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '')}
          onClick={() => setShowAddModal(true)}
          title="Add quick link"
          aria-label="Add quick link"
        >
          <i className="bi bi-plus-lg" style={{ fontSize: '1rem', color: '#fff' }} />
        </button>
      </div>

      {/* ── Modals ───────────────────────────────────────────────────── */}
      {showAddModal && (
        <AddQuickLinkModal
          onSave={handleAdd}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {showManager && (
        <QuickLinkManager
          links={links}
          onUpdate={updateLink}
          onDelete={deleteLink}
          onReorder={reorderLinks}
          onAddNew={() => { setShowManager(false); setShowAddModal(true); }}
          onClose={() => setShowManager(false)}
        />
      )}
    </>
  );
}
