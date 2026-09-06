import React, { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';
import { Users, Plus, Shield, Check, X } from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');
  const [roleId, setRoleId] = useState(3);
  const [error, setError] = useState('');

  const loadUsers = () => {
    apiRequest('/users')
      .then((res) => { if (res.success) setUsers(res.data); })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadUsers(); }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await apiRequest('/users', {
        method: 'POST',
        body: JSON.stringify({ fullName, email, password, roleId: Number(roleId) })
      });
      setShowModal(false);
      setFullName('');
      setEmail('');
      loadUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>User Management</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>Admin control portal for user accounts and roles.</p>
        </div>

        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          <Plus size={18} />
          <span>Add User</span>
        </button>
      </div>

      {loading ? (
        <div>Loading users...</div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Full Name</th>
                <th style={{ padding: '0.75rem 1rem' }}>Email</th>
                <th style={{ padding: '0.75rem 1rem' }}>Role</th>
                <th style={{ padding: '0.75rem 1rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{u.full_name}</td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text-muted)' }}>{u.email}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span className="badge" style={{
                      background: u.role === 'ADMIN' ? '#fef3c7' : u.role === 'MANAGER' ? '#e0f2fe' : '#f1f5f9',
                      color: u.role === 'ADMIN' ? '#b45309' : u.role === 'MANAGER' ? '#0369a1' : '#475569'
                    }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span style={{ color: u.is_active ? '#15803d' : '#b91c1c', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      {u.is_active ? <Check size={16} /> : <X size={16} />}
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add User Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
        }}>
          <div className="card" style={{ maxWidth: '440px', width: '90%' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Create New Account</h2>

            {error && (
              <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleCreateUser}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. David Miller"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="david@tracker.com"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password *</label>
                <input
                  type="password"
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Role *</label>
                <select
                  className="form-select"
                  value={roleId}
                  onChange={(e) => setRoleId(e.target.value)}
                >
                  <option value={1}>ADMIN</option>
                  <option value={2}>MANAGER</option>
                  <option value={3}>EMPLOYEE</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}