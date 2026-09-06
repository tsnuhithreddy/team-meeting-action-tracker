import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Calendar, CheckSquare, ListTodo, Users, History } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const { user } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'MANAGER', 'EMPLOYEE'] },
    { id: 'meetings', label: 'Meetings', icon: Calendar, roles: ['ADMIN', 'MANAGER', 'EMPLOYEE'] },
    { id: 'tasks', label: 'Task Board', icon: CheckSquare, roles: ['ADMIN', 'MANAGER', 'EMPLOYEE'] },
    { id: 'my-tasks', label: 'My Tasks', icon: ListTodo, roles: ['ADMIN', 'MANAGER', 'EMPLOYEE'] },
    { id: 'users', label: 'Users', icon: Users, roles: ['ADMIN'] },
    { id: 'activity', label: 'Activity Logs', icon: History, roles: ['ADMIN', 'MANAGER'] }
  ];

  const visibleItems = navItems.filter((item) => item.roles.includes(user?.role));

  return (
    <aside style={{
      width: '240px',
      background: 'var(--color-surface)',
      borderRight: '1px solid var(--color-border)',
      padding: '1.25rem 0.75rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.25rem',
      flexShrink: 0
    }}>
      <div style={{ padding: '0 0.75rem 0.75rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
        Workspace Navigation
      </div>

      {visibleItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              width: '100%',
              padding: '0.625rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: isActive ? 'var(--color-primary-light)' : 'transparent',
              color: isActive ? 'var(--color-primary)' : 'var(--color-text-main)',
              fontWeight: isActive ? 600 : 500,
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'var(--transition)'
            }}
          >
            <Icon size={18} style={{ color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)' }} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </aside>
  );
}