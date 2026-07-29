import { useState, useRef } from 'react';
import type { QuickLink } from './quicklink.types';

// ── Sub-component: Inline Editor ─────────────────────────────────────────────

interface EditRowProps {
  link: QuickLink;
  onSave: (patch: { name: string; url: string }) => Promise<void>;
  onDelete: () => void;
  onCancel: () => void;
}

function EditRow({ link, onSave, onDelete, onCancel }: EditRowProps) {
  const [name, setName] = useState(link.name);
  const [url, setUrl] = useState(link.url);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim() || !url.trim()) { setError('Name and URL are required.'); return; }
    setIsSaving(true);
    try {
      await onSave({ name: name.trim(), url: url.trim() });
    } catch (err: any) {
      setError(err.message ?? 'Save failed.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-3 border-bottom border-secondary bg-dark-subtle">
      <div className="mb-2">
        <label className="form-label text-secondary small mb-1">Name</label>
        <input
          type="text"
          className="form-control form-control-sm bg-dark text-white border-secondary shadow-none"
          value={name}
          onChange={(e) => { setName(e.target.value); setError(''); }}
        />
      </div>
      <div className="mb-2">
        <label className="form-label text-secondary small mb-1">URL</label>
        <input
          type="url"
          className="form-control form-control-sm bg-dark text-white border-secondary shadow-none"
          value={url}
          onChange={(e) => { setUrl(e.target.value); setError(''); }}
        />
      </div>
      {error && <p className="text-danger small mb-2">{error}</p>}
      <div className="d-flex gap-2">
        <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={isSaving}>
          {isSaving ? <span className="spinner-border spinner-border-sm" /> : 'Save'}
        </button>
        <button className="btn btn-outline-danger btn-sm" onClick={onDelete}>Delete</button>
        <button className="btn btn-outline-secondary btn-sm ms-auto" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

// ── Delete Confirmation Modal ─────────────────────────────────────────────────

interface DeleteConfirmProps {
  name: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function DeleteConfirm({ name, onConfirm, onCancel }: DeleteConfirmProps) {
  return (
    <>
      <div className="modal-backdrop fade show" style={{ zIndex: 1060 }} />
      <div
        className="modal fade show"
        style={{ display: 'block', zIndex: 1065 }}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        data-bs-theme="dark"
      >
        <div className="modal-dialog modal-dialog-centered modal-sm">
          <div className="modal-content text-bg-dark border-secondary">
            <div className="modal-header border-secondary">
              <h5 className="modal-title">Delete Quick Link?</h5>
            </div>
            <div className="modal-body text-center">
              <p className="fw-semibold mb-1">{name}</p>
              <p className="text-secondary small mb-0">This action cannot be undone.</p>
            </div>
            <div className="modal-footer border-secondary justify-content-center gap-2">
              <button id="ql-delete-cancel-btn" className="btn btn-outline-secondary btn-sm" onClick={onCancel}>Cancel</button>
              <button id="ql-delete-confirm-btn" className="btn btn-danger btn-sm" onClick={onConfirm}>Delete</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Main Manager ──────────────────────────────────────────────────────────────

interface Props {
  links: QuickLink[];
  onUpdate: (id: string, patch: { name?: string; url?: string }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onReorder: (links: QuickLink[]) => Promise<void>;
  onAddNew: () => void;
  onClose: () => void;
}

export function QuickLinkManager({ links, onUpdate, onDelete, onReorder, onAddNew, onClose }: Props) {
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingLink, setDeletingLink] = useState<QuickLink | null>(null);

  // Drag-and-drop state
  const dragIndex = useRef<number | null>(null);
  const [orderedLinks, setOrderedLinks] = useState<QuickLink[]>(links);

  // Keep local list in sync when parent updates
  if (links.length !== orderedLinks.length ||
      links.some((l, i) => l.id !== orderedLinks[i]?.id || l.name !== orderedLinks[i]?.name)) {
    setOrderedLinks([...links]);
  }

  const filtered = search.trim()
    ? orderedLinks.filter((l) => {
        const q = search.toLowerCase();
        return l.name.toLowerCase().includes(q) ||
          l.url.toLowerCase().includes(q) ||
          l.domain.toLowerCase().includes(q);
      })
    : orderedLinks;

  // ── Drag & Drop handlers ──────────────────────────────────────────────────

  const handleDragStart = (index: number) => {
    dragIndex.current = index;
  };

  const handleDragOver = (e: React.DragEvent, overIndex: number) => {
    e.preventDefault();
    if (dragIndex.current === null || dragIndex.current === overIndex) return;

    const updated = [...orderedLinks];
    const [moved] = updated.splice(dragIndex.current, 1);
    updated.splice(overIndex, 0, moved);
    dragIndex.current = overIndex;
    setOrderedLinks(updated);
  };

  const handleDrop = async () => {
    dragIndex.current = null;
    await onReorder(orderedLinks);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  const favicon = (link: QuickLink) =>
    link.favicon
      ? <img src={link.favicon} alt="" width={16} height={16} className="me-2 rounded-1 flex-shrink-0" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
      : <span className="me-2 d-inline-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 16, height: 16, background: '#444', borderRadius: 3, fontSize: 9, color: '#fff' }}>{link.name.charAt(0).toUpperCase()}</span>;

  return (
    <>
      {/* Backdrop */}
      <div className="modal-backdrop fade show" />

      <div
        className="modal fade show"
        style={{ display: 'block' }}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ql-manager-title"
        data-bs-theme="dark"
      >
        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable" style={{ maxWidth: 560 }}>
          <div className="modal-content text-bg-dark border-secondary">

            {/* Header */}
            <div className="modal-header border-secondary">
              <h5 className="modal-title" id="ql-manager-title">Manage Quick Links</h5>
              <button type="button" className="btn-close btn-close-white" onClick={onClose} aria-label="Close" />
            </div>

            {/* Search */}
            <div className="px-3 pt-3 pb-2">
              <input
                id="ql-manager-search"
                type="search"
                className="form-control bg-dark text-white border-secondary shadow-none"
                placeholder="Search…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Links list */}
            <div className="modal-body p-0" style={{ maxHeight: 420, overflowY: 'auto' }}>
              {filtered.length === 0 && (
                <div className="text-secondary text-center py-5 small">
                  {search ? 'No links match your search.' : 'No quick links yet. Add one!'}
                </div>
              )}

              {filtered.map((link, index) => (
                <div key={link.id}>
                  {editingId === link.id ? (
                    <EditRow
                      link={link}
                      onSave={async (patch) => { await onUpdate(link.id, patch); setEditingId(null); }}
                      onDelete={() => setDeletingLink(link)}
                      onCancel={() => setEditingId(null)}
                    />
                  ) : (
                    <div
                      className="d-flex align-items-center px-3 py-2 border-bottom border-secondary ql-manager-row"
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDrop={handleDrop}
                      style={{ cursor: 'grab' }}
                    >
                      {/* Drag handle */}
                      <i className="bi bi-grip-vertical text-secondary me-2 flex-shrink-0" />

                      {/* Favicon */}
                      {favicon(link)}

                      {/* Info */}
                      <div className="flex-grow-1 overflow-hidden">
                        <div className="fw-semibold text-truncate" style={{ fontSize: '0.9rem' }}>{link.name}</div>
                        <div className="text-secondary text-truncate" style={{ fontSize: '0.75rem' }}>{link.url}</div>
                      </div>

                      {/* Edit button */}
                      <button
                        className="btn btn-sm btn-outline-secondary ms-2 flex-shrink-0"
                        onClick={() => setEditingId(link.id)}
                        aria-label={`Edit ${link.name}`}
                      >
                        <i className="bi bi-pencil" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="modal-footer border-secondary justify-content-between">
              <button id="ql-manager-add-btn" className="btn btn-outline-primary btn-sm" onClick={onAddNew}>
                <i className="bi bi-plus-lg me-1" />
                Add Link
              </button>
              <button id="ql-manager-close-btn" className="btn btn-secondary btn-sm" onClick={onClose}>
                Close
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Delete confirmation */}
      {deletingLink && (
        <DeleteConfirm
          name={deletingLink.name}
          onCancel={() => setDeletingLink(null)}
          onConfirm={async () => {
            await onDelete(deletingLink.id);
            setDeletingLink(null);
            setEditingId(null);
          }}
        />
      )}
    </>
  );
}
