import { defineStore, acceptHMRUpdate } from 'pinia'
import { api } from 'boot/axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: '',
    user: {
      _id: '',
      account: '',
      role: 0,
      name: '',
      email: '',
      phone: '',
      gender: '',
      ageGroup: '',
      bio: '',
      skills: [],
      totalHours: 0,
      avatar: '',
    },
  }),
  getters: {
    isLoggedIn: (state) => !!state.token,
    isAdmin: (state) => state.user.role === 1,
    avatar: (state) =>
      state.user.account
        ? `https://api.dicebear.com/9.x/thumbs/svg?seed=${state.user.account}`
        : 'https://api.dicebear.com/9.x/thumbs/svg?seed=default',
  },
  actions: {
    updateUserSkills(newSkills) {
      if (this.user) this.user = { ...this.user, skills: [...newSkills] }
    },
    async login(form) {
      try {
        const { data } = await api.post('/user/login', form)
        const { token, ...userData } = data.result
        this.token = token

        this.user = {
          ...userData,
          skills: userData.skills || [],
          totalHours: Math.floor(userData.totalHours ?? 0),
        }
        return true
      } catch (error) {
        console.log(error)
        return false
      }
    },
    async fetchProfile() {
      if (!this.token) return
      try {
        const { data } = await api.get('/user/profile')
        const userData = data.result

        // 使用解構賦值確保原本 state 裡沒寫到的欄位也能被 reactive 追蹤
        this.user = {
          ...this.user,
          ...userData,
          skills: userData.skills || [],
          totalHours: Math.floor(userData.totalHours ?? 0),
        }
      } catch (error) {
        console.log('Fetch Profile Error:', error)
        // 如果 token 失效，建議導向登出
      }
    },
    logout() {
      this.token = ''
      this.user = {
        _id: '',
        account: '',
        role: 0,
        name: '',
        email: '',
        phone: '',
        gender: '',
        ageGroup: '',
        bio: '',
        skills: [],
        totalHours: 0,
      }
    },
  },
  persist: true,
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot))
}
