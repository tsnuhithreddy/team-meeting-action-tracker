import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar, LogOut, User } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header style={{
      background: 'var(--color-surface)',
      borderBottom: '1px solid var(--color-border)',
      padding: '0.875rem 1.5rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 10
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{
          background: 'var(--color-primary-light)',
          color: 'var(--color-primary)',
          padding: '0.4rem',
          borderRadius: 'var(--radius-md)',
          display: 'flex'
        }}>
          <Calendar size={22} />
        </div>
        <span style={{ fontWeight: 700, fontSize: '1.1rem', letterSpacing: '-0.01em' }}>
          Team Meeting & Action Tracker
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'var(--color-bg)',
          padding: '0.35rem 0.75rem',
          borderRadius: 'var(--radius-full)',
          border: '1px solid var(--color-border)',
          fontSize: '0.875rem'
        }}>
          <User size={16} style={{ color: 'var(--color-primary)' }} />
          <span style={{ fontWeight: 600 }}>{user?.fullName}</span>
          <span className="badge" style={{
            background: user?.role === 'ADMIN' ? '#fef3c7' : user?.role === 'MANAGER' ? '#e0f2fe' : '#f1f5f9',
            color: user?.role === 'ADMIN' ? '#b45309' : user?.role === 'MANAGER' ? '#0369a1' : '#475569',
            fontSize: '0.7rem'
          }}>
            {user?.role}
          </span>
        </div>

        <button
          onClick={logout}
          className="btn btn-secondary"
          style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
          title="Sign Out"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </header>
  );
}