import React, { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Calendar, CheckSquare, Clock, AlertTriangle, 
  CheckCircle, ShieldAlert, Users, ArrowRight 
} from 'lucide-react';

export default function DashboardPage({ setActiveTab }) {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest('/dashboard')
      .then((res) => {
        if (res.success) setData(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading dashboard metrics...</div>;
  }

  const { metrics, upcomingMeetings, recentActivity } = data || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header Greeting */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>
          Welcome back, {user?.fullName} 👋
        </h1>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Here is an overview of your team meetings, action items, and project health.
        </p>
      </div>

      {/* Critical / Overdue Alert Banner */}
      {metrics?.overdueTasks > 0 && (
        <div style={{
          background: '#ffe4e6',
          border: '1px solid #fecdd3',
          padding: '1rem 1.25rem',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: '#9f1239'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertTriangle size={24} style={{ color: '#e11d48' }} />
            <div>
              <strong style={{ display: 'block', fontSize: '0.95rem' }}>
                {metrics.overdueTasks} Overdue Action Item{metrics.overdueTasks > 1 ? 's' : ''} Detected
              </strong>
              <span style={{ fontSize: '0.85rem' }}>These tasks have passed their due date without being marked completed.</span>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('tasks')}
            className="btn"
            style={{ background: '#be123c', color: '#fff', fontSize: '0.85rem' }}
          >
            View Overdue Tasks
          </button>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.25rem'
      }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Meetings</span>
            <Calendar size={20} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>{metrics?.totalMeetings || 0}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>Scheduled sessions</div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#0284c7', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Open Tasks</span>
            <Clock size={20} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>{metrics?.openTasks || 0}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>Pending start</div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#b45309', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>In Progress</span>
            <CheckSquare size={20} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>{metrics?.inProgressTasks || 0}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>Active work</div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#b91c1c', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Blocked</span>
            <ShieldAlert size={20} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>{metrics?.blockedTasks || 0}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>Needs resolution</div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#15803d', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Completed</span>
            <CheckCircle size={20} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>{metrics?.completedTasks || 0}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>Successfully closed</div>
        </div>
      </div>

      {/* Two Column Layout: Upcoming Meetings & Recent Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        {/* Upcoming Meetings Card */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Upcoming Meetings</h2>
            <button
              onClick={() => setActiveTab('meetings')}
              className="btn btn-secondary"
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
            >
              View All
            </button>
          </div>

          {upcomingMeetings?.length === 0 ? (
            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>No upcoming meetings scheduled.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {upcomingMeetings?.map((m) => (
                <div key={m.id} style={{
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-bg)',
                  border: '1px solid var(--color-border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{m.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
                      📅 {m.meeting_date} • 🕒 {m.start_time} - {m.end_time}
                    </div>
                  </div>
                  <span className="badge badge-priority-MEDIUM">Scheduled</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity Card */}
        <div className="card">
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.25rem' }}>
            Audit & Activity Trail
          </h2>

          {recentActivity?.length === 0 ? (
            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>No recent activities recorded.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {recentActivity?.map((log) => (
                <div key={log.id} style={{
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-bg)',
                  border: '1px solid var(--color-border)',
                  fontSize: '0.85rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <strong>{log.user_name || 'System'}</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div style={{ color: 'var(--color-text-main)' }}>{log.details}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}