const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Centralized API request helper
 * Automatically injects JWT Bearer token from localStorage
 */
export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('tracker_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'An unexpected error occurred.');
  }

  return data;
}