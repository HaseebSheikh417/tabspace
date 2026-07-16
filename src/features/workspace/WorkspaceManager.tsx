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
    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex={-1} data-bs-theme="dark">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content text-bg-dark border-secondary">
          <div className="modal-header border-secondary">
            <h5 className="modal-title">Manage Workspaces</h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose} aria-label="Close"></button>
          </div>
          <div className="modal-body p-0">
            <ul className="list-group list-group-flush rounded-bottom">
              {workspaces.map((ws) => (
                <li key={ws.id} className="list-group-item bg-dark text-light border-secondary d-flex justify-content-between align-items-center py-3">
                  <div className="d-flex flex-column">
                    <span className="fw-semibold mb-1">{ws.name}</span>
                    <div className="d-flex gap-2">
                      {ws.isDefault && <span className="badge bg-secondary">Default</span>}
                      {ws.id === activeWorkspace?.id && <span className="badge bg-primary">Active</span>}
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    {ws.id !== activeWorkspace?.id && (
                      <button className="btn btn-sm btn-outline-light" onClick={() => switchWorkspace(ws.id)}>Switch</button>
                    )}
                    <button className="btn btn-sm btn-outline-light" onClick={() => handleRename(ws.id, ws.name)}>Rename</button>
                    {!ws.isDefault && (
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(ws.id, ws.name)}>Delete</button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
