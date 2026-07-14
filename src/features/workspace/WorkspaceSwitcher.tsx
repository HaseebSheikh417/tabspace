import { useState, useRef, useEffect } from 'react';
import { useWorkspaceStore } from './workspace.store';
import { WorkspaceManager } from './WorkspaceManager';

export function WorkspaceSwitcher() {
  const { workspaces, activeWorkspace, switchWorkspace, createWorkspace } = useWorkspaceStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isManagerOpen, setIsManagerOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCreate = async () => {
    const name = window.prompt('Enter new workspace name:');
    if (name && name.trim()) {
      try {
        await createWorkspace(name.trim());
        setIsOpen(false);
      } catch (err: any) {
        alert(err.message || 'Failed to create workspace');
      }
    }
  };

  if (!activeWorkspace) return null;

  return (
    <>
      <div className="workspace-switcher" ref={dropdownRef}>
        <button 
          className="workspace-switcher-btn" 
          onClick={() => setIsOpen(!isOpen)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span className="workspace-switcher-name">{activeWorkspace.name}</span>
          <svg className="workspace-switcher-icon" viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>

        {isOpen && (
          <div className="workspace-dropdown" role="listbox">
            <ul className="workspace-list">
              {workspaces.map((ws) => (
                <li key={ws.id} role="option" aria-selected={ws.id === activeWorkspace.id}>
                  <button
                    className={`workspace-item ${ws.id === activeWorkspace.id ? 'workspace-item--active' : ''}`}
                    onClick={() => {
                      switchWorkspace(ws.id);
                      setIsOpen(false);
                    }}
                  >
                    <span className="workspace-item-name">{ws.name}</span>
                    {ws.id === activeWorkspace.id && (
                      <svg className="workspace-item-check" viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                </li>
              ))}
            </ul>
            <div className="workspace-dropdown-divider" />
            <div className="workspace-dropdown-actions">
              <button className="workspace-action-btn" onClick={handleCreate}>
                <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Create Workspace
              </button>
              <button className="workspace-action-btn" onClick={() => {
                setIsOpen(false);
                setIsManagerOpen(true);
              }}>
                <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
                Manage Workspaces
              </button>
            </div>
          </div>
        )}
      </div>

      <WorkspaceManager isOpen={isManagerOpen} onClose={() => setIsManagerOpen(false)} />
    </>
  );
}
