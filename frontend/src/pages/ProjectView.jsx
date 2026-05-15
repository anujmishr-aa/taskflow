import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const initials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
const COLORS = ['#7c6bef','#16a34a','#d97706','#dc2626','#0891b2','#9333ea','#e11d48','#0284c7'];
const isOverdue = (date, status) => status !== 'Done' && date && new Date(date) < new Date();

export default function ProjectView() {
  const { projectId } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myRole, setMyRole] = useState('Member');

  // Modals
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', assignedTo: '', priority: 'Medium', dueDate: '', status: 'To Do' });
  const [memberEmail, setMemberEmail] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAll();
  }, [projectId]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [projRes, taskRes, statsRes, allProjRes] = await Promise.all([
        api.get(`/projects/${projectId}`),
        api.get(`/tasks/project/${projectId}`),
        api.get(`/dashboard/${projectId}`),
        api.get('/projects'),
      ]);
      setProject(projRes.data);
      setTasks(taskRes.data);
      setStats(statsRes.data);
      setProjects(allProjRes.data);
      const me = projRes.data.members.find(m => (m.user._id || m.user) === user._id);
      setMyRole(me?.role || 'Member');
    } catch {
      toast.error('Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const tasksByStatus = (status) => tasks.filter(t => t.status === status);

  const openCreateTask = () => {
    setEditTask(null);
    setTaskForm({ title: '', description: '', assignedTo: '', priority: 'Medium', dueDate: '', status: 'To Do' });
    setShowTaskModal(true);
  };

  const openEditTask = (task) => {
    setEditTask(task);
    setTaskForm({
      title: task.title,
      description: task.description || '',
      assignedTo: task.assignedTo?._id || '',
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
      status: task.status,
    });
    setShowTaskModal(true);
  };

  const handleSaveTask = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editTask) {
        // Existing task: admin sends all fields, member only sends status
        const payload = myRole === 'Admin' ? { ...taskForm } : { status: taskForm.status };
        const { data } = await api.put(`/tasks/${editTask._id}`, payload);
        setTasks(tasks.map(t => t._id === editTask._id ? data : t));
        toast.success('Task updated!');
      } else {
        const { data } = await api.post('/tasks', { ...taskForm, projectId });
        setTasks([data, ...tasks]);
        toast.success('Task created!');
      }
      setShowTaskModal(false);
      // Refresh stats
      const { data: newStats } = await api.get(`/dashboard/${projectId}`);
      setStats(newStats);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save task');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(tasks.filter(t => t._id !== taskId));
      toast.success('Task deleted');
      const { data: newStats } = await api.get(`/dashboard/${projectId}`);
      setStats(newStats);
    } catch {
      toast.error('Failed to delete task');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.post(`/projects/${projectId}/members`, { email: memberEmail });
      setProject(data);
      setMemberEmail('');
      setShowMemberModal(false);
      toast.success('Member added!');
      const { data: newStats } = await api.get(`/dashboard/${projectId}`);
      setStats(newStats);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add member');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Remove this member?')) return;
    try {
      await api.delete(`/projects/${projectId}/members/${memberId}`);
      setProject({ ...project, members: project.members.filter(m => (m.user._id || m.user) !== memberId) });
      toast.success('Member removed');
    } catch {
      toast.error('Failed to remove member');
    }
  };

  if (loading) return <div className="loading">Loading project...</div>;

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
          <div className="nav-item" onClick={() => navigate('/')}>🏠 Dashboard</div>
          {stats && (
            <>
              <div className="nav-item">📋 My Tasks <span className="nav-badge">{tasks.filter(t => t.assignedTo?._id === user._id).length}</span></div>
              <div className="nav-item">⚠️ Overdue <span className="nav-badge red">{stats.overdue}</span></div>
            </>
          )}
        </div>

        <div className="sidebar-projects">
          <div className="sidebar-section-label">Projects</div>
          {projects.map(p => (
            <div key={p._id} className={`project-item ${p._id === projectId ? 'active' : ''}`} onClick={() => navigate(`/project/${p._id}`)}>
              <div className="project-dot" style={{ background: p.color }} />
              <span className={`project-name ${p._id === projectId ? 'active' : ''}`}>{p.name}</span>
            </div>
          ))}
          <div className="sidebar-add-btn" onClick={() => navigate('/')}>+ New project</div>
        </div>

        <div className="sidebar-footer">
          <div className="user-row" onClick={logout}>
            <div className="avatar">{initials(user?.name)}</div>
            <div>
              <div className="user-name-sm">{user?.name}</div>
              <div className="user-role-sm">{myRole} · logout</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="main-content">
        <div className="topbar">
          <div className="topbar-title">
            {project?.name}
            <span className="topbar-sub">{myRole}</span>
          </div>
          <div className="search-box">
            <span style={{ fontSize: 14 }}>🔍</span>
            <input placeholder="Search tasks..." onChange={e => {/* filter below */}} />
          </div>
          {myRole === 'Admin' && (
            <button className="btn-add" onClick={openCreateTask}>+ New Task</button>
          )}
        </div>

        <div className="page-content">
          {/* Stats */}
          {stats && (
            <div className="stats-row">
              <div className="stat-card">
                <div className="stat-icon purple">📋</div>
                <div className="stat-num">{stats.total}</div>
                <div className="stat-label">Total Tasks</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon green">✅</div>
                <div className="stat-num">{stats.done}</div>
                <div className="stat-label">Completed</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon amber">⏳</div>
                <div className="stat-num">{stats.inProgress}</div>
                <div className="stat-label">In Progress</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon red">🚨</div>
                <div className="stat-num">{stats.overdue}</div>
                <div className="stat-label">Overdue</div>
              </div>
            </div>
          )}

          <div className="two-col">
            {/* Kanban */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">Task Board</div>
              </div>
              <div className="kanban-board">
                {['To Do', 'In Progress', 'Done'].map(status => (
                  <div key={status}>
                    <div className="kanban-col-title">
                      {status === 'To Do' ? '⬜' : status === 'In Progress' ? '🔵' : '✅'} {status}
                      <span className="col-count">{tasksByStatus(status).length}</span>
                    </div>
                    {tasksByStatus(status).length === 0 && (
                      <div style={{ fontSize: 12, color: 'var(--text-light)', padding: '8px 0' }}>No tasks</div>
                    )}
                    {tasksByStatus(status).map(task => (
                      <div key={task._id} className={`task-card ${status === 'Done' ? 'task-done' : ''}`} onClick={() => openEditTask(task)}>
                        <div className="task-title">{task.title}</div>
                        <div className="task-meta">
                          <span className={`priority-badge ${task.priority}`}>{task.priority}</span>
                          {task.dueDate && (
                            <span className={`due-chip ${isOverdue(task.dueDate, task.status) ? 'overdue' : ''}`}>
                              📅 {new Date(task.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            </span>
                          )}
                          {task.assignedTo && (
                            <div className="assignee-chip" title={task.assignedTo.name}>
                              {initials(task.assignedTo.name)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Right panel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Team */}
              <div className="card">
                <div className="card-header">
                  <div className="card-title">Team Members</div>
                  {myRole === 'Admin' && <button className="card-action" onClick={() => setShowMemberModal(true)}>+ Add</button>}
                </div>
                {stats?.members?.map(m => (
                  <div key={m.userId} className="member-row">
                    <div className="member-av" style={{ background: COLORS[m.name.charCodeAt(0) % COLORS.length] }}>
                      {initials(m.name)}
                    </div>
                    <div className="member-name">{m.name}</div>
                    <span className={`role-badge ${m.role}`}>{m.role}</span>
                    <span className="task-count-badge">{m.taskCount}</span>
                    {myRole === 'Admin' && m.role !== 'Admin' && (
                      <button className="btn btn-sm" style={{ marginLeft: 4, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red)', fontSize: 14 }}
                        onClick={() => handleRemoveMember(m.userId)} title="Remove member">✕</button>
                    )}
                  </div>
                ))}
              </div>

              {/* Progress */}
              {stats && (
                <div className="card">
                  <div className="card-header"><div className="card-title">Progress</div></div>
                  <div className="progress-section">
                    {[
                      { label: 'Done', value: stats.done, color: '#16a34a' },
                      { label: 'In Progress', value: stats.inProgress, color: '#d97706' },
                      { label: 'To Do', value: stats.todo, color: '#7c6bef' },
                    ].map(item => (
                      <div key={item.label} className="prog-item">
                        <div className="prog-row">
                          <span className="prog-name">{item.label}</span>
                          <span className="prog-pct">{stats.total > 0 ? Math.round((item.value / stats.total) * 100) : 0}%</span>
                        </div>
                        <div className="prog-bar">
                          <div className="prog-fill" style={{ width: `${stats.total > 0 ? (item.value / stats.total) * 100 : 0}%`, background: item.color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Task Modal */}
      {showTaskModal && (
        <div className="modal-overlay" onClick={() => setShowTaskModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">{editTask ? 'Edit Task' : 'Create New Task'}</div>
            <form onSubmit={handleSaveTask}>
              {(myRole === 'Admin' || !editTask) && (
                <>
                  <div className="form-group">
                    <label className="form-label">Title *</label>
                    <input className="form-input" value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <input className="form-input" value={taskForm.description} onChange={e => setTaskForm({ ...taskForm, description: e.target.value })} />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Priority</label>
                      <select className="form-select" value={taskForm.priority} onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })}>
                        <option>High</option><option>Medium</option><option>Low</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Due Date</label>
                      <input className="form-input" type="date" value={taskForm.dueDate} onChange={e => setTaskForm({ ...taskForm, dueDate: e.target.value })} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Assign To</label>
                    <select className="form-select" value={taskForm.assignedTo} onChange={e => setTaskForm({ ...taskForm, assignedTo: e.target.value })}>
                      <option value="">Unassigned</option>
                      {project?.members.map(m => (
                        <option key={m.user._id} value={m.user._id}>{m.user.name}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" value={taskForm.status} onChange={e => setTaskForm({ ...taskForm, status: e.target.value })}>
                  <option>To Do</option><option>In Progress</option><option>Done</option>
                </select>
              </div>
              <div className="modal-footer">
                {editTask && myRole === 'Admin' && (
                  <button type="button" className="btn btn-danger btn-sm" onClick={() => { setShowTaskModal(false); handleDeleteTask(editTask._id); }}>
                    Delete
                  </button>
                )}
                <button type="button" className="btn btn-ghost" onClick={() => setShowTaskModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ width: 'auto' }} disabled={saving}>
                  {saving ? 'Saving...' : editTask ? 'Update Task' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showMemberModal && (
        <div className="modal-overlay" onClick={() => setShowMemberModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Add Team Member</div>
            <form onSubmit={handleAddMember}>
              <div className="form-group">
                <label className="form-label">Member's Email</label>
                <input className="form-input" type="email" placeholder="teammate@example.com" value={memberEmail}
                  onChange={e => setMemberEmail(e.target.value)} required />
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>They must already have a TaskFlow account.</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowMemberModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ width: 'auto' }} disabled={saving}>
                  {saving ? 'Adding...' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
