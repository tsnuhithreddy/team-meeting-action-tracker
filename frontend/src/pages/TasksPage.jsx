import React, { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plus, MessageSquare, AlertCircle, Calendar, User, Trash2 } from 'lucide-react';

export default function TasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeCommentTask, setActiveCommentTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState('');

  // Create Task Form
  const [meetingId, setMeetingId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [dueDate, setDueDate] = useState('');

  const loadTasks = () => {
    apiRequest('/tasks')
      .then((res) => {
        if (res.success) setTasks(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTasks();
    apiRequest('/meetings').then((res) => { if (res.success) setMeetings(res.data); }).catch(() => {});
    if (user?.role !== 'EMPLOYEE') {
      apiRequest('/users').then((res) => { if (res.success) setUsersList(res.data); }).catch(() => {});
    }
  }, [user]);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await apiRequest(`/tasks/${taskId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
      loadTasks();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await apiRequest('/tasks', {
        method: 'POST',
        body: JSON.stringify({
          meetingId: Number(meetingId),
          title,
          description,
          assigneeId: assigneeId ? Number(assigneeId) : null,
          priority,
          dueDate
        })
      });
      setShowCreateModal(false);
      setTitle('');
      setDescription('');
      loadTasks();
    } catch (err) {
      setError(err.message);
    }
  };

  const openComments = async (task) => {
    setActiveCommentTask(task);
    try {
      const res = await apiRequest(`/tasks/${task.id}/comments`);
      if (res.success) setComments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await apiRequest(`/tasks/${activeCommentTask.id}/comments`, {
        method: 'POST',
        body: JSON.stringify({ commentText: newComment })
      });
      setNewComment('');
      const res = await apiRequest(`/tasks/${activeCommentTask.id}/comments`);
      if (res.success) setComments(res.data);
    } catch (err) {
      alert(err.message);
    }
  };

  const columns = ['OPEN', 'IN_PROGRESS', 'BLOCKED', 'COMPLETED'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Task Kanban Board</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>Track action items and state progression.</p>
        </div>

        {user?.role !== 'EMPLOYEE' && (
          <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
            <Plus size={18} />
            <span>Create Action Item</span>
          </button>
        )}
      </div>

      {loading ? (
        <div>Loading tasks...</div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.25rem',
          alignItems: 'start'
        }}>
          {columns.map((colStatus) => {
            const colTasks = tasks.filter((t) => t.status === colStatus);
            return (
              <div key={colStatus} style={{
                background: 'var(--color-surface-hover)',
                borderRadius: 'var(--radius-lg)',
                padding: '1rem',
                border: '1px solid var(--color-border)',
                minHeight: '400px'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem'
                }}>
                  <span className={`badge badge-status-${colStatus}`}>
                    {colStatus.replace('_', ' ')}
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>
                    {colTasks.length}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {colTasks.map((t) => (
                    <div key={t.id} className="card" style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span className={`badge badge-priority-${t.priority}`}>{t.priority}</span>
                        {t.is_overdue && (
                          <span className="badge badge-overdue">OVERDUE</span>
                        )}
                      </div>

                      <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.25rem' }}>{t.title}</h4>
                      {t.description && (
                        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
                          {t.description}
                        </p>
                      )}

                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '0.75rem' }}>
                        <div>👤 Assignee: <strong>{t.assignee_name || 'Unassigned'}</strong></div>
                        <div>📅 Due: <strong>{t.due_date}</strong></div>
                      </div>

                      {/* Status Selector */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid var(--color-border)' }}>
                        <select
                          className="form-select"
                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', width: 'auto' }}
                          value={t.status}
                          onChange={(e) => handleStatusChange(t.id, e.target.value)}
                        >
                          {columns.map((st) => (
                            <option key={st} value={st}>{st.replace('_', ' ')}</option>
                          ))}
                        </select>

                        <button
                          onClick={() => openComments(t)}
                          className="btn btn-secondary"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                        >
                          <MessageSquare size={14} />
                          <span>Discuss</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Task Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
        }}>
          <div className="card" style={{ maxWidth: '500px', width: '90%' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Create Action Item</h2>

            {error && (
              <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleCreateTask}>
              <div className="form-group">
                <label className="form-label">Linked Meeting *</label>
                <select
                  className="form-select"
                  value={meetingId}
                  onChange={(e) => setMeetingId(e.target.value)}
                  required
                >
                  <option value="">Select a meeting...</option>
                  {meetings.map((m) => (
                    <option key={m.id} value={m.id}>{m.title} ({m.meeting_date})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Task Title *</label>
                <input
                  type="text"
                  className="form-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Implement Supertest test cases"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Action item details..."
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Assignee</label>
                  <select
                    className="form-select"
                    value={assigneeId}
                    onChange={(e) => setAssigneeId(e.target.value)}
                  >
                    <option value="">Unassigned</option>
                    {usersList.map((u) => (
                      <option key={u.id} value={u.id}>{u.full_name} ({u.role})</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select
                    className="form-select"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Due Date *</label>
                <input
                  type="date"
                  className="form-input"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Comments Discussion Modal */}
      {activeCommentTask && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
        }}>
          <div className="card" style={{ maxWidth: '550px', width: '90%', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{activeCommentTask.title}</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Discussion & Notes</span>
              </div>
              <button
                onClick={() => setActiveCommentTask(null)}
                style={{ background: 'transparent', border: 'none', fontSize: '1.25rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Comment Thread List */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingRight: '0.5rem', marginBottom: '1rem' }}>
              {comments.length === 0 ? (
                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem' }}>
                  No comments yet. Start the conversation below!
                </div>
              ) : (
                comments.map((c) => (
                  <div key={c.id} style={{
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--color-bg)',
                    border: '1px solid var(--color-border)',
                    fontSize: '0.85rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <strong>{c.author_name} ({c.author_role})</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        {new Date(c.created_at).toLocaleString()}
                      </span>
                    </div>
                    <div>{c.comment_text}</div>
                  </div>
                ))
              )}
            </div>

            {/* Add Comment Input */}
            <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                required
              />
              <button type="submit" className="btn btn-primary" style={{ flexShrink: 0 }}>
                Post
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}