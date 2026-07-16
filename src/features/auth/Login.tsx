import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder for login logic
    console.log('Logging in with', { username, password });
    navigate('/');
  };

  return (
    <div className="min-vh-100 d-flex flex-column bg-dark text-light align-items-center justify-content-center">
      <div className="card text-bg-dark border-secondary p-4 shadow" style={{ width: '100%', maxWidth: '400px' }}>
        <div className="card-body">
          <div className="text-center mb-4">
            <span className='d-inline-flex align-items-center justify-content-center mb-3' style={{ fontSize: '1.5rem', fontWeight: 'bold', width: '48px', height: '48px', backgroundColor: '#0d6efd', color: '#fff', borderRadius: '50%' }}>T</span>
            <h2 className="card-title fw-bold">Sign In</h2>
            <p className="text-secondary small">Welcome back to Tabspace</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label text-secondary fw-semibold">Username</label>
              <input
                type="text"
                className="form-control bg-dark text-light border-secondary shadow-none"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label className="form-label text-secondary fw-semibold">Password</label>
              <input
                type="password"
                className="form-control bg-dark text-light border-secondary shadow-none"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-100 mb-3 fw-bold">Login</button>
            <div className="text-center text-secondary small">
              Don't have an account? <Link to="/register" className="text-decoration-none">Create one</Link> or <Link to="/" className="text-decoration-none">Use as guest</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
