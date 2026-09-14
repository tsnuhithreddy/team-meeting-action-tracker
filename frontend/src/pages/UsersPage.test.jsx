import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import UsersPage from './UsersPage';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn()
}));

vi.mock('../services/api', () => ({
  apiRequest: vi.fn()
}));

const USERS = [
  { id: 1, full_name: 'System Admin', email: 'admin@tracker.com', role: 'ADMIN', is_active: 1 },
  { id: 2, full_name: 'Project Manager Alice', email: 'alice@tracker.com', role: 'MANAGER', is_active: 1 },
  { id: 4, full_name: 'QA Engineer Charlie', email: 'charlie@tracker.com', role: 'EMPLOYEE', is_active: 0 }
];

describe('UsersPage — deactivate button (real component, jsdom)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ user: { id: 1, role: 'ADMIN' } });
    window.confirm = vi.fn(() => true);
  });

  it('renders a Deactivate button for other active users', async () => {
    apiRequest.mockResolvedValueOnce({ success: true, data: USERS });
    render(<UsersPage />);
    await waitFor(() => screen.getByText('Project Manager Alice'));

    const aliceRow = screen.getByText('Project Manager Alice').closest('tr');
    expect(aliceRow.querySelector('button')).not.toBeNull();
    expect(aliceRow.textContent).toContain('Deactivate');
  });

  it('does NOT render a Deactivate button for the currently logged-in user (self-guard)', async () => {
    apiRequest.mockResolvedValueOnce({ success: true, data: USERS });
    render(<UsersPage />);
    await waitFor(() => screen.getByText('System Admin'));

    const ownRow = screen.getByText('System Admin').closest('tr');
    expect(ownRow.textContent).not.toContain('Deactivate');
    expect(ownRow.textContent).toContain('(you)');
  });

  it('does NOT render a Deactivate button for an already-inactive user', async () => {
    apiRequest.mockResolvedValueOnce({ success: true, data: USERS });
    render(<UsersPage />);
    await waitFor(() => screen.getByText('QA Engineer Charlie'));

    const charlieRow = screen.getByText('QA Engineer Charlie').closest('tr');
    expect(charlieRow.textContent).not.toContain('Deactivate');
  });

  it('asks for confirmation, then calls DELETE /users/:id, then reloads the list', async () => {
    apiRequest
      .mockResolvedValueOnce({ success: true, data: USERS })
      .mockResolvedValueOnce({ success: true, message: 'Deactivated' })
      .mockResolvedValueOnce({ success: true, data: USERS });

    render(<UsersPage />);
    await waitFor(() => screen.getByText('Project Manager Alice'));

    const aliceRow = screen.getByText('Project Manager Alice').closest('tr');
    const button = aliceRow.querySelector('button');
    fireEvent.click(button);

    expect(window.confirm).toHaveBeenCalledTimes(1);
    expect(window.confirm.mock.calls[0][0]).toContain('Project Manager Alice');

    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith('/users/2', { method: 'DELETE' });
    });

    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledTimes(3);
    });
  });

  it('does NOT call the API if the confirm dialog is dismissed', async () => {
    apiRequest.mockResolvedValueOnce({ success: true, data: USERS });
    window.confirm = vi.fn(() => false);

    render(<UsersPage />);
    await waitFor(() => screen.getByText('Project Manager Alice'));

    const aliceRow = screen.getByText('Project Manager Alice').closest('tr');
    fireEvent.click(aliceRow.querySelector('button'));

    expect(window.confirm).toHaveBeenCalledTimes(1);
    expect(apiRequest).toHaveBeenCalledTimes(1);
  });

  it('shows a visible error banner if the deactivation request fails', async () => {
    apiRequest
      .mockResolvedValueOnce({ success: true, data: USERS })
      .mockRejectedValueOnce(new Error('Access denied. Only an Admin can perform this action.'));

    render(<UsersPage />);
    await waitFor(() => screen.getByText('Project Manager Alice'));

    const aliceRow = screen.getByText('Project Manager Alice').closest('tr');
    fireEvent.click(aliceRow.querySelector('button'));

    await waitFor(() => {
      expect(screen.getByText('Access denied. Only an Admin can perform this action.')).toBeTruthy();
    });
  });
});