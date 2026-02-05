import { api } from 'boot/axios'

// 取得所有活動列表 (志工前台用，通常只抓 status: 'open')
export const getEvents = (params) => {
  return api.get('/event', { params })
}

// 取得所有活動列表 (管理員後台用，包含已關閉活動)
export const getAllEvents = () => {
  return api.get('/event/all')
}

export const getEventById = (id) => {
  // 增加 timestamp 防止部分瀏覽器緩存舊的人數資料
  return api.get(`/event/${id}?t=${new Date().getTime()}`)
}

// 增加 note 參數，讓使用者報名時可以填寫備註
export const joinEvent = (eventId, note) => api.post('/application', { event: eventId, note })

export const createEvent = (data) => api.post('/event', data)

export const updateEvent = (id, data) => api.patch(`/event/${id}`, data)

export const deleteEvent = (id) => api.delete(`/event/${id}`)
