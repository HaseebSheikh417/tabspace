import { useState } from 'react';

interface Props {
  onSave: (url: string) => Promise<void>;
  onClose: () => void;
}

export function AddQuickLinkModal({ onSave, onClose }: Props) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    const trimmed = url.trim();
    if (!trimmed) {
      setError('Please enter a URL.');
      return;
    }
    setError('');
    setIsSaving(true);
    try {
      await onSave(trimmed);
      onClose();
    } catch (err: any) {
      setError(err.message ?? 'Failed to add quick link.');
    } finally {
      setIsSaving(false);
    }
  };

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
        aria-labelledby="add-ql-title"
        data-bs-theme="dark"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content text-bg-dark border-secondary">

            <div className="modal-header border-secondary">
              <h5 className="modal-title" id="add-ql-title">Add Quick Link</h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={onClose}
                aria-label="Close"
                disabled={isSaving}
              />
            </div>

            <div className="modal-body">
              <label htmlFor="ql-url-input" className="form-label text-secondary fw-semibold">
                URL
              </label>
              <input
                id="ql-url-input"
                type="url"
                className={`form-control bg-dark text-white border-secondary shadow-none${error ? ' is-invalid' : ''}`}
                placeholder="https://github.com"
                value={url}
                autoFocus
                onChange={(e) => { setUrl(e.target.value); setError(''); }}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); }}
                disabled={isSaving}
              />
              {error && <div className="invalid-feedback">{error}</div>}
              <p className="text-secondary small mt-2 mb-0">
                The name and icon will be detected automatically.
              </p>
            </div>

            <div className="modal-footer border-secondary">
              <button
                id="ql-cancel-btn"
                className="btn btn-outline-secondary"
                onClick={onClose}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                id="ql-save-btn"
                className="btn btn-primary"
                onClick={handleSave}
                disabled={!url.trim() || isSaving}
              >
                {isSaving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                    Saving...
                  </>
                ) : (
                  'Save'
                )}
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
