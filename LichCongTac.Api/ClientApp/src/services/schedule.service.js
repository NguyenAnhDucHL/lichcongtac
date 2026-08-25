import { apiClient } from '../lib/apiClient'

export const scheduleService = {
  getSchedules: () => apiClient('/api/schedules'),
  getScheduleById: (id) => apiClient(`/api/schedules/${id}`),
  searchSchedules: (params) => {
    const query = new URLSearchParams(params).toString()
    return apiClient(`/api/schedules?${query}`)
  },
  getPublicSchedule: (params) => {
    const searchParams = new URLSearchParams(params || {})
    searchParams.append('_t', Date.now()) // Bắt buộc iOS PWA bypass cache
    return apiClient(`/api/schedules/public-schedule?${searchParams.toString()}`)
  },
  searchPublicSchedules: (params) => {
    const searchParams = new URLSearchParams(params || {})
    searchParams.append('_t', Date.now())
    return apiClient(`/api/schedules/public-search?${searchParams.toString()}`)
  },
  getTodayHoliday: () => apiClient('/api/holidays/today'),
}
