import { useWorkspaceStore } from './workspace.store';

export function WorkspaceManager({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { workspaces, activeWorkspace, renameWorkspace, deleteWorkspace, switchWorkspace } = useWorkspaceStore();

  if (!isOpen) return null;

  const handleRename = async (id: string, currentName: string) => {
    const newName = window.prompt('Rename workspace:', currentName);
    if (newName && newName.trim() && newName.trim() !== currentName) {
      try {
        await renameWorkspace(id, newName.trim());
      } catch (err: any) {
        alert(err.message || 'Failed to rename workspace');
      }
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete workspace "${name}"? All tasks inside will be lost.`)) {
      try {
        await deleteWorkspace(id);
      } catch (err: any) {
        alert(err.message || 'Failed to delete workspace');
      }
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content workspace-manager-modal">
        <div className="modal-header">
          <h2 className="modal-title">Manage Workspaces</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="modal-body">
          <ul className="workspace-manage-list">
            {workspaces.map((ws) => (
              <li key={ws.id} className="workspace-manage-item">
                <div className="workspace-manage-info">
                  <span className="workspace-manage-name">{ws.name}</span>
                  {ws.isDefault && <span className="workspace-badge">Default</span>}
                  {ws.id === activeWorkspace?.id && <span className="workspace-badge workspace-badge--active">Active</span>}
                </div>
                <div className="workspace-manage-actions">
                  {ws.id !== activeWorkspace?.id && (
                    <button className="btn-text" onClick={() => switchWorkspace(ws.id)}>Switch</button>
                  )}
                  <button className="btn-text" onClick={() => handleRename(ws.id, ws.name)}>Rename</button>
                  {!ws.isDefault && (
                    <button className="btn-text btn-text--danger" onClick={() => handleDelete(ws.id, ws.name)}>Delete</button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
