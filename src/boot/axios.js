import { defineBoot } from '#q-app/wrappers'
import axios from 'axios'
import { Notify } from 'quasar'
import { useAuthStore } from 'src/stores/auth'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL })

export default defineBoot(({ app }) => {
  api.interceptors.request.use(
    (config) => {
      const auth = useAuthStore()
      if (auth.token) {
        config.headers.Authorization = `Bearer ${auth.token}`
      }
      return config
    },
    (_error) => {
      return Promise.reject(_error)
    },
  )

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      const auth = useAuthStore()
      const message = error.response?.data?.message || '發生未知錯誤'

      // 若 Token 過期 (401)，自動執行登出清除狀態
      if (error.response?.status === 401) {
        auth.logout()
        Notify.create({
          type: 'warning',
          message: '登入逾時，請重新登入',
          position: 'top',
        })
      } else {
        Notify.create({
          type: 'negative',
          message: message,
          position: 'top',
          timeout: 2000,
        })
      }

      return Promise.reject(error)
    },
  )

  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
})

export { api }
