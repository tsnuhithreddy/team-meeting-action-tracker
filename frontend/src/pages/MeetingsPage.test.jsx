import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import MeetingsPage from './MeetingsPage';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn()
}));

vi.mock('../services/api', () => ({
  apiRequest: vi.fn()
}));

const MEETINGS = [
  {
    id: 1,
    title: 'Sprint Planning',
    description: 'Plan the sprint',
    meeting_date: '2026-12-01',
    start_time: '10:00:00',
    end_time: '11:00:00',
    location_or_link: 'Zoom',
    created_by: 2,
    creator_name: 'Project Manager Alice',
    total_tasks: 3,
    total_participants: 4
  },
  {
    id: 2,
    title: 'Someone Else\'s Meeting',
    description: '',
    meeting_date: '2026-12-05',
    start_time: '14:00:00',
    end_time: '15:00:00',
    location_or_link: '',
    created_by: 99,
    creator_name: 'Someone Else',
    total_tasks: 0,
    total_participants: 2
  }
];

describe('MeetingsPage — edit meeting (real component, jsdom)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.confirm = vi.fn(() => true);
  });

  it('shows an Edit button for the meeting creator (Manager Alice)', async () => {
    useAuth.mockReturnValue({ user: { id: 2, role: 'MANAGER' } });
    apiRequest
      .mockResolvedValueOnce({ success: true, data: MEETINGS })
      .mockResolvedValueOnce({ success: true, data: [] });
    render(<MeetingsPage />);
    await waitFor(() => screen.getByText('Sprint Planning'));

    const card = screen.getByText('Sprint Planning').closest('.card');
    expect(card.querySelector('[title="Edit Meeting"]')).not.toBeNull();
  });

  it('does NOT show an Edit button for a Manager who did not create the meeting', async () => {
    useAuth.mockReturnValue({ user: { id: 2, role: 'MANAGER' } });
    apiRequest
      .mockResolvedValueOnce({ success: true, data: MEETINGS })
      .mockResolvedValueOnce({ success: true, data: [] });
    render(<MeetingsPage />);
    await waitFor(() => screen.getByText('Someone Else\'s Meeting'));

    const card = screen.getByText('Someone Else\'s Meeting').closest('.card');
    expect(card.querySelector('[title="Edit Meeting"]')).toBeNull();
  });

  it('ALWAYS shows an Edit button for ADMIN, even on a meeting they did not create', async () => {
    useAuth.mockReturnValue({ user: { id: 1, role: 'ADMIN' } });
    apiRequest
      .mockResolvedValueOnce({ success: true, data: MEETINGS })
      .mockResolvedValueOnce({ success: true, data: [] });
    render(<MeetingsPage />);
    await waitFor(() => screen.getByText('Someone Else\'s Meeting'));

    const card = screen.getByText('Someone Else\'s Meeting').closest('.card');
    expect(card.querySelector('[title="Edit Meeting"]')).not.toBeNull();
  });

  it('pre-fills the form with the meeting\'s current details when Edit is clicked', async () => {
    useAuth.mockReturnValue({ user: { id: 2, role: 'MANAGER' } });
    apiRequest
      .mockResolvedValueOnce({ success: true, data: MEETINGS })
      .mockResolvedValueOnce({ success: true, data: [] });
    render(<MeetingsPage />);
    await waitFor(() => screen.getByText('Sprint Planning'));

    const card = screen.getByText('Sprint Planning').closest('.card');
    fireEvent.click(card.querySelector('[title="Edit Meeting"]'));

    await waitFor(() => screen.getByText('Edit Meeting'));
    expect(screen.getByDisplayValue('Sprint Planning')).toBeTruthy();
    expect(screen.getByDisplayValue('Plan the sprint')).toBeTruthy();
    expect(screen.getByDisplayValue('2026-12-01')).toBeTruthy();
    expect(screen.getByDisplayValue('10:00')).toBeTruthy();
    expect(screen.getByDisplayValue('Zoom')).toBeTruthy();
    expect(screen.queryByText('Invite Participants')).toBeNull();
    expect(screen.getByText(/Participants can only be set/)).toBeTruthy();
  });

  it('submits a PUT (not POST) with the edited fields and no participantIds', async () => {
    useAuth.mockReturnValue({ user: { id: 2, role: 'MANAGER' } });
    apiRequest
      .mockResolvedValueOnce({ success: true, data: MEETINGS })
      .mockResolvedValueOnce({ success: true, data: [] })
      .mockResolvedValueOnce({ success: true, data: {} })
      .mockResolvedValueOnce({ success: true, data: MEETINGS });

    render(<MeetingsPage />);
    await waitFor(() => screen.getByText('Sprint Planning'));

    const card = screen.getByText('Sprint Planning').closest('.card');
    fireEvent.click(card.querySelector('[title="Edit Meeting"]'));
    await waitFor(() => screen.getByText('Edit Meeting'));

    const titleInput = screen.getByDisplayValue('Sprint Planning');
    fireEvent.change(titleInput, { target: { value: 'Sprint Planning (Revised)' } });
    fireEvent.click(screen.getByText('Save Changes'));

    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith('/meetings/1', expect.objectContaining({ method: 'PUT' }));
    });

    const putCall = apiRequest.mock.calls.find((c) => c[0] === '/meetings/1');
    const body = JSON.parse(putCall[1].body);
    expect(body.title).toBe('Sprint Planning (Revised)');
    expect(body.startTime).toBe('10:00:00');
    expect(body).not.toHaveProperty('participantIds');
  });

  it('resets to create mode (empty form) after Cancel is clicked following an edit', async () => {
    useAuth.mockReturnValue({ user: { id: 2, role: 'MANAGER' } });
    apiRequest
      .mockResolvedValueOnce({ success: true, data: MEETINGS })
      .mockResolvedValueOnce({ success: true, data: [] });
    render(<MeetingsPage />);
    await waitFor(() => screen.getByText('Sprint Planning'));

    const card = screen.getByText('Sprint Planning').closest('.card');
    fireEvent.click(card.querySelector('[title="Edit Meeting"]'));
    await waitFor(() => screen.getByText('Edit Meeting'));
    fireEvent.click(screen.getByText('Cancel'));

    fireEvent.click(screen.getByText('Schedule Meeting'));
    await waitFor(() => screen.getByText('Schedule New Meeting'));
    expect(screen.queryByDisplayValue('Sprint Planning')).toBeNull();
    expect(screen.getByText('Invite Participants')).toBeTruthy();
  });
});