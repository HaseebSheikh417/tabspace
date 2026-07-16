import { useState } from 'react';
import { useWorkspaceStore } from './workspace.store';
import { WorkspaceManager } from './WorkspaceManager';

export function WorkspaceSwitcher() {
  const {
    workspaces,
    activeWorkspace,
    switchWorkspace,
    createWorkspace,
  } = useWorkspaceStore();

  const [isManagerOpen, setIsManagerOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [workspaceName, setWorkspaceName] = useState('');

  const d = async () => {
    const name = workspaceName.trim();

    if (!name) return;

    try {
      await createWorkspace(name);
      setShowCreateModal(false);
      setWorkspaceName('');
    } catch (err: any) {
      alert(err.message || 'Failed to create workspace');
    }
  };

  if (!activeWorkspace) return null;

  return (
    <>
      <div className="dropdown">
        <button
          className="btn btn-outline-secondary dropdown-toggle d-flex align-items-center"
          type="button"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          {activeWorkspace.name}
        </button>

        <ul className="dropdown-menu shadow">
          {workspaces.map((ws) => (
            <li key={ws.id}>
              <button
                className={`dropdown-item d-flex justify-content-between align-items-center ${ws.id === activeWorkspace.id ? 'active' : ''
                  }`}
                onClick={() => switchWorkspace(ws.id)}
              >
                <span>{ws.name}</span>

                {ws.id === activeWorkspace.id && (
                  <i className="bi bi-check-lg"></i>
                )}
              </button>
            </li>
          ))}

          <li>
            <hr className="dropdown-divider" />
          </li>

          <li>
            <button
              className="dropdown-item"
              onClick={() => setShowCreateModal(true)}
            >
              <i className="bi bi-plus-lg me-2"></i>
              Create Workspace
            </button>
          </li>

          <li>
            <button
              className="dropdown-item"
              onClick={() => setIsManagerOpen(true)}
            >
              <i className="bi bi-gear me-2"></i>
              Manage Workspaces
            </button>
          </li>
        </ul>
      </div>

      <WorkspaceManager
        isOpen={isManagerOpen}
        onClose={() => setIsManagerOpen(false)}
      />

      {/* Create Workspace Modal */}
      {showCreateModal && (
        <>
          <div className="modal-backdrop fade show"></div>

          <div
            className="modal fade show"
            style={{ display: 'block' }}
            tabIndex={-1}
            data-bs-theme="dark"
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content text-bg-dark">

                <div className="modal-header border-secondary">
                  <h5 className="modal-title">
                    Create Workspace
                  </h5>

                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => {
                      setWorkspaceName('');
                      setShowCreateModal(false);
                    }}
                  />
                </div>

                <div className="modal-body">
                  <label className="form-label text-secondary fw-semibold">
                    Workspace Name
                  </label>

                  <input
                    type="text"
                    className="form-control bg-dark text-white border-secondary shadow-none"
                    placeholder="Enter workspace name"
                    value={workspaceName}
                    autoFocus
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        d();
                      }
                    }}
                  />
                </div>

                <div className="modal-footer border-secondary">
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => {
                      setWorkspaceName('');
                      setShowCreateModal(false);
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    className="btn btn-primary"
                    disabled={!workspaceName.trim()}
                    onClick={d}
                  >
                    Create
                  </button>
                </div>

              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}