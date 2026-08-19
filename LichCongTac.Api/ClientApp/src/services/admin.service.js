import { apiClient } from '../lib/apiClient'

export const adminService = {
  // Users
  getUsers: () => apiClient('/api/users'),
  createUser: (data) =>
    apiClient('/api/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateUser: (id, data) =>
    apiClient(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteUser: (id) =>
    apiClient(`/api/users/${id}`, {
      method: 'DELETE',
    }),

  // Departments
  getDepartments: () => apiClient('/api/departments'),
  createDepartment: (data) =>
    apiClient('/api/departments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateDepartment: (id, data) =>
    apiClient(`/api/departments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteDepartment: (id) => apiClient(`/api/departments/${id}`, { method: 'DELETE' }),

  // Holidays
  getHolidays: () => apiClient('/api/holidays'),
  createHoliday: (data) =>
    apiClient('/api/holidays', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateHoliday: (id, data) =>
    apiClient(`/api/holidays/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteHoliday: (id) => apiClient(`/api/holidays/${id}`, { method: 'DELETE' }),

  // Schedules
  getSchedules: () => apiClient('/api/schedules'),
  getSchedulesPaginated: (page = 1, pageSize = 10, keyword = '') => {
    const params = new URLSearchParams({ page, pageSize })
    if (keyword) params.append('keyword', keyword)
    return apiClient(`/api/schedules?${params.toString()}`)
  },
  createSchedule: (data) =>
    apiClient('/api/schedules', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateSchedule: (id, data) =>
    apiClient(`/api/schedules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteSchedule: (id) => apiClient(`/api/schedules/${id}`, { method: 'DELETE' }),

  // Notifications
  getNotifications: () => apiClient('/api/notifications'),
  sendNotification: (data) =>
    apiClient('/api/notifications', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  deleteNotification: (id) => apiClient(`/api/notifications/${id}`, { method: 'DELETE' }),
}
