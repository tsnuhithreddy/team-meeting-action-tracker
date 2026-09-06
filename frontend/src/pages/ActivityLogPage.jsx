import React, { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';
import { History, Filter } from 'lucide-react';

export default function ActivityLogPage() {
  const [logs, setLogs] = useState([]);
  const [entityFilter, setEntityFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const loadLogs = (type = '') => {
    setLoading(true);
    const url = type ? `/activity?entityType=${type}` : '/activity';
    apiRequest(url)
      .then((res) => { if (res.success) setLogs(res.data); })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadLogs(entityFilter); }, [entityFilter]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Audit & Activity Trail</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>Complete historical log of system actions and changes.</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={16} style={{ color: 'var(--color-text-muted)' }} />
          <select
            className="form-select"
            style={{ width: 'auto', fontSize: '0.85rem' }}
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
          >
            <option value="">All Entities</option>
            <option value="MEETING">Meetings</option>
            <option value="TASK">Tasks</option>
            <option value="COMMENT">Comments</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div>Loading activity logs...</div>
      ) : logs.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <History size={40} style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }} />
          <h3>No activity records found</h3>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Timestamp</th>
                <th style={{ padding: '0.75rem 1rem' }}>User</th>
                <th style={{ padding: '0.75rem 1rem' }}>Action</th>
                <th style={{ padding: '0.75rem 1rem' }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                    {new Date(l.created_at).toLocaleString()}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>
                    {l.user_name || 'System'}
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span className="badge" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                      {l.action}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>{l.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}