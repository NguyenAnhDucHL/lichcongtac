import { apiClient } from '../lib/apiClient'

export const scheduleService = {
  getSchedules: () => apiClient('/api/schedules'),
  getScheduleById: (id) => apiClient(`/api/schedules/${id}`),
  searchSchedules: (params) => {
    const query = new URLSearchParams(params).toString()
    return apiClient(`/api/schedules?${query}`)
  },
  getPublicSchedule: (params) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : ''
    return apiClient(`/api/schedules/public-schedule${query}`)
  },
  getTodayHoliday: () => apiClient('/api/holidays/today'),
}
