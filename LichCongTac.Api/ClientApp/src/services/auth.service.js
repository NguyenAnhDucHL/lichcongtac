import { apiClient } from '../lib/apiClient'

export const authService = {
  login: (credentials) =>
    apiClient('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    }),

  logout: () =>
    apiClient('/api/auth/logout', {
      method: 'POST',
    }),

  changePassword: (data) =>
    apiClient('/api/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  getProfile: () => apiClient('/api/auth/profile'),
}
