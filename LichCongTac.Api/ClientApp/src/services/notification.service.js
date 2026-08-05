import { apiClient } from '../lib/apiClient'

export const notificationService = {
  getNotifications: () => apiClient('/api/notifications'),
  createNotification: (data) =>
    apiClient('/api/notifications', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateNotification: (id, data) =>
    apiClient(`/api/notifications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteNotification: (id) =>
    apiClient(`/api/notifications/${id}`, {
      method: 'DELETE',
    }),
  getVisibleNotifications: () => apiClient('/api/notifications/visible'),
  getVapidPublicKey: () => apiClient('/api/notification/vapid-public-key'),
  subscribePush: (data) =>
    apiClient('/api/notification/subscribe', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  unsubscribePush: (endpoint) =>
    apiClient('/api/notification/unsubscribe', {
      method: 'POST',
      body: JSON.stringify({ endpoint }),
    }),
}
