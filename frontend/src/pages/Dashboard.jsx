import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const PROJECT_COLORS = ['#7c6bef', '#16a34a', '#d97706', '#dc2626', '#0891b2', '#9333ea'];

const initials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', color: '#7c6bef' });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data } = await api.get('/projects');
      setProjects(data);
    } catch {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Project name is required');
    setCreating(true);
    try {
      const { data } = await api.post('/projects', form);
      setProjects([data, ...projects]);
      setShowModal(false);
      setForm({ name: '', description: '', color: '#7c6bef' });
      toast.success('Project created!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">⚡</div>
          <div>
            <div className="sidebar-logo-text">TaskFlow</div>
            <div className="sidebar-logo-sub">workspace</div>
          </div>
        </div>

        <div className="sidebar-nav">
          <div className="sidebar-section-label">Main</div>
          <div className="nav-item active">🏠 Dashboard</div>
        </div>

        <div className="sidebar-projects">
          <div className="sidebar-section-label">Projects</div>
          {projects.map(p => (
            <div key={p._id} className="project-item" onClick={() => navigate(`/project/${p._id}`)}>
              <div className="project-dot" style={{ background: p.color }} />
              <span className="project-name">{p.name}</span>
            </div>
          ))}
          <div className="sidebar-add-btn" onClick={() => setShowModal(true)}>
            + New project
          </div>
        </div>

        <div className="sidebar-footer">
          <div className="user-row" onClick={logout}>
            <div className="avatar">{initials(user?.name)}</div>
            <div>
              <div className="user-name-sm">{user?.name}</div>
              <div className="user-role-sm">Click to logout</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="main-content">
        <div className="topbar">
          <div className="topbar-title">Dashboard</div>
          <button className="btn-add" onClick={() => setShowModal(true)}>+ New Project</button>
        </div>

        <div className="page-content">
          {loading ? (
            <div className="loading">Loading projects...</div>
          ) : projects.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: 40 }}>📋</div>
              <p>No projects yet. Create your first project to get started!</p>
              <button className="btn btn-primary" style={{ marginTop: 16, width: 'auto', padding: '10px 24px' }} onClick={() => setShowModal(true)}>
                Create Project
              </button>
            </div>
          ) : (
            <>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
                {projects.length} project{projects.length !== 1 ? 's' : ''} — click to open
              </p>
              <div className="projects-grid">
                {projects.map(p => {
                  const myRole = p.members.find(m => m.user._id === user._id || m.user === user._id)?.role;
                  return (
                    <div key={p._id} className="project-card" onClick={() => navigate(`/project/${p._id}`)}>
                      <div style={{ marginBottom: 10 }}>
                        <span className="project-card-color" style={{ background: p.color }} />
                        <span className="project-card-name">{p.name}</span>
                      </div>
                      <div className="project-card-desc">{p.description || 'No description'}</div>
                      <div className="project-card-meta">
                        <span>👥 {p.members.length} member{p.members.length !== 1 ? 's' : ''}</span>
                        <span className={`role-badge ${myRole}`}>{myRole}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </main>

      {/* New Project Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Create New Project</div>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Project Name *</label>
                <input className="form-input" placeholder="e.g. Website Redesign" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <input className="form-input" placeholder="What is this project about?" value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Color</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {PROJECT_COLORS.map(c => (
                    <div key={c} onClick={() => setForm({ ...form, color: c })}
                      style={{ width: 28, height: 28, borderRadius: '50%', background: c, cursor: 'pointer',
                        border: form.color === c ? '3px solid #333' : '3px solid transparent' }} />
                  ))}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ width: 'auto' }} disabled={creating}>
                  {creating ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
