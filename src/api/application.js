import { api } from 'boot/axios'

export const getMyApplications = () => api.get('/application')

export const cancelApplication = (id) => api.delete(`/application/${id}`)

// 取得特定活動的所有報名清單 (管理員用)
export const getEventApplications = (eventId) => api.get(`/application/event/${eventId}`)

// 審核報名狀態 (管理員用)
// data: { status: 'approved' | 'rejected', reviewComment?: string }
export const updateApplicationStatus = (id, data) => api.patch(`/application/${id}`, data)

// 取得用戶通知列表
export const getMyNotifications = () => api.get('/application/notifications')

// 將特定通知標記為已讀
export const markNotificationRead = (id) =>
  api.patch(`/application/notifications/${id}`, { isRead: true })
