import { api } from 'src/boot/axios'

export const register = (form) => {
  return api.post('/user/register', form)
}

export const getProfile = () => {
  return api.get('/user/profile')
}

export const updateProfile = (form) => {
  return api.patch('/user/me', form)
}

// 管理員取得特定志工資料
export const getAdminUserProfile = (id) => {
  return api.get(`/user/profile/${id}`)
}

// 取得管理員儀表板數據
export const getAdminDashboardStats = () => {
  return api.get('/user/dashboard')
}
