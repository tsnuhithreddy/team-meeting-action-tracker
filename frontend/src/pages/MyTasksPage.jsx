import React, { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';
import { CheckSquare, Clock, Calendar } from 'lucide-react';

export default function MyTasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadMyTasks = () => {
    apiRequest('/tasks/my-tasks')
      .then((res) => {
        if (res.success) setTasks(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadMyTasks();
  }, []);

  const handleStatusUpdate = async (taskId, newStatus) => {
    try {
      await apiRequest(`/tasks/${taskId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
      loadMyTasks();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>My Assigned Tasks</h1>
        <p style={{ color: 'var(--color-text-muted)' }}>Manage your personal deliverables and update your status.</p>
      </div>

      {loading ? (
        <div>Loading your tasks...</div>
      ) : tasks.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <CheckSquare size={40} style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }} />
          <h3>No tasks assigned to you</h3>
          <p style={{ color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>You're all caught up!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {tasks.map((t) => (
            <div key={t.id} className="card" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem 1.25rem'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span className={`badge badge-priority-${t.priority}`}>{t.priority}</span>
                  {t.is_overdue && <span className="badge badge-overdue">OVERDUE</span>}
                  <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>{t.title}</h4>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                  From Meeting: <strong>{t.meeting_title}</strong> • Due Date: <strong>{t.due_date}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span className={`badge badge-status-${t.status}`}>
                  {t.status.replace('_', ' ')}
                </span>
                <select
                  className="form-select"
                  style={{ fontSize: '0.8rem', padding: '0.35rem 0.5rem', width: 'auto' }}
                  value={t.status}
                  onChange={(e) => handleStatusUpdate(t.id, e.target.value)}
                >
                  <option value="OPEN">OPEN</option>
                  <option value="IN_PROGRESS">IN PROGRESS</option>
                  <option value="BLOCKED">BLOCKED</option>
                  <option value="COMPLETED">COMPLETED</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}