import React, { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Calendar, Plus, Clock, MapPin, Users, Trash2, Edit } from 'lucide-react';

export default function MeetingsPage() {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMeetingId, setEditingMeetingId] = useState(null);
  const [error, setError] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [meetingDate, setMeetingDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:00');
  const [locationOrLink, setLocationOrLink] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState([]);

  const loadMeetings = () => {
    apiRequest('/meetings')
      .then((res) => {
        if (res.success) setMeetings(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadMeetings();
    // Load users for participant selection if Manager/Admin
    if (user?.role !== 'EMPLOYEE') {
      apiRequest('/users?activeOnly=true')
        .then((res) => {
          if (res.success) setUsersList(res.data);
        })
        .catch(() => {});
    }
  }, [user]);

  const closeModal = () => {
    setShowModal(false);
    setEditingMeetingId(null);
    setTitle('');
    setDescription('');
    setLocationOrLink('');
    setSelectedParticipants([]);
    setError('');
  };

  const openEditModal = (meeting) => {
    setEditingMeetingId(meeting.id);
    setTitle(meeting.title);
    setDescription(meeting.description || '');
    setMeetingDate(meeting.meeting_date);
    // Time columns come back as HH:MM:SS; <input type="time"> needs HH:MM.
    setStartTime((meeting.start_time || '').slice(0, 5));
    setEndTime((meeting.end_time || '').slice(0, 5));
    setLocationOrLink(meeting.location_or_link || '');
    setError('');
    setShowModal(true);
  };

  const handleSubmitMeeting = async (e) => {
    e.preventDefault();
    setError('');
    const payload = {
      title,
      description,
      meetingDate,
      startTime: startTime.length === 5 ? `${startTime}:00` : startTime,
      endTime: endTime.length === 5 ? `${endTime}:00` : endTime,
      locationOrLink
    };
    // Participants can only be set at creation today — editing a meeting
    // does not currently support changing who's invited (see note below),
    // so we deliberately don't send participantIds on an edit submission.
    if (!editingMeetingId) {
      payload.participantIds = selectedParticipants;
    }

    try {
      if (editingMeetingId) {
        await apiRequest(`/meetings/${editingMeetingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      } else {
        await apiRequest('/meetings', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }
      closeModal();
      loadMeetings();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteMeeting = async (id) => {
    if (!window.confirm('Are you sure you want to delete this meeting? All linked tasks will be removed.')) return;
    try {
      await apiRequest(`/meetings/${id}`, { method: 'DELETE' });
      loadMeetings();
    } catch (err) {
      alert(err.message);
    }
  };

  const toggleParticipant = (userId) => {
    setSelectedParticipants((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Team Meetings</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>Schedule meetings and coordinate agendas.</p>
        </div>

        {user?.role !== 'EMPLOYEE' && (
          <button onClick={() => setShowModal(true)} className="btn btn-primary">
            <Plus size={18} />
            <span>Schedule Meeting</span>
          </button>
        )}
      </div>

      {loading ? (
        <div>Loading meetings...</div>
      ) : meetings.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Calendar size={40} style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }} />
          <h3>No meetings found</h3>
          <p style={{ color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
            {user?.role === 'EMPLOYEE' ? 'You have not been added to any meetings yet.' : 'Click "Schedule Meeting" to create one.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {meetings.map((m) => (
            <div key={m.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{m.title}</h3>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {(user?.role === 'ADMIN' || m.created_by === user?.id) && (
                      <button
                        onClick={() => openEditModal(m)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--color-primary)', cursor: 'pointer' }}
                        title="Edit Meeting"
                      >
                        <Edit size={16} />
                      </button>
                    )}
                    {user?.role !== 'EMPLOYEE' && (
                      <button
                        onClick={() => handleDeleteMeeting(m.id)}
                        style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                        title="Delete Meeting"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>

                {m.description && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                    {m.description}
                  </p>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--color-text-main)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Calendar size={16} style={{ color: 'var(--color-primary)' }} />
                    <span>{m.meeting_date}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock size={16} style={{ color: 'var(--color-primary)' }} />
                    <span>{m.start_time} - {m.end_time}</span>
                  </div>
                  {m.location_or_link && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <MapPin size={16} style={{ color: 'var(--color-primary)' }} />
                      <span>{m.location_or_link}</span>
                    </div>
                  )}
                </div>
              </div>

              <div style={{
                marginTop: '1.25rem',
                paddingTop: '0.75rem',
                borderTop: '1px solid var(--color-border)',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.75rem',
                color: 'var(--color-text-muted)'
              }}>
                <span>Created by: {m.creator_name}</span>
                <span>{m.total_tasks} Tasks • {m.total_participants} Attending</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Schedule Meeting Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100
        }}>
          <div className="card" style={{ maxWidth: '500px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>
              {editingMeetingId ? 'Edit Meeting' : 'Schedule New Meeting'}
            </h2>

            {error && (
              <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmitMeeting}>
              <div className="form-group">
                <label className="form-label">Meeting Title *</label>
                <input
                  type="text"
                  className="form-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Sprint 2 Planning"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description / Agenda</label>
                <textarea
                  className="form-textarea"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Topics to discuss..."
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Date *</label>
                  <input
                    type="date"
                    className="form-input"
                    value={meetingDate}
                    onChange={(e) => setMeetingDate(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Start Time *</label>
                  <input
                    type="time"
                    className="form-input"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">End Time *</label>
                  <input
                    type="time"
                    className="form-input"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Location or Video Link</label>
                <input
                  type="text"
                  className="form-input"
                  value={locationOrLink}
                  onChange={(e) => setLocationOrLink(e.target.value)}
                  placeholder="Zoom / Google Meet / Room B"
                />
              </div>

              {/* Participant Multi-select — creation only. Editing a meeting
                  today does not change who's invited, since the update
                  endpoint doesn't sync the participant list; showing the
                  picker here would silently do nothing. */}
              {editingMeetingId ? (
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', padding: '0.5rem 0', marginBottom: '0.5rem' }}>
                  Participants can only be set when a meeting is first created.
                </div>
              ) : (
                <div className="form-group">
                  <label className="form-label">Invite Participants</label>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0.5rem',
                    maxHeight: '120px',
                    overflowY: 'auto',
                    border: '1px solid var(--color-border)',
                    padding: '0.5rem',
                    borderRadius: 'var(--radius-md)'
                  }}>
                    {usersList.map((u) => (
                      <label key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={selectedParticipants.includes(u.id)}
                          onChange={() => toggleParticipant(u.id)}
                        />
                        <span>{u.full_name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={closeModal} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingMeetingId ? 'Save Changes' : 'Create Meeting'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}