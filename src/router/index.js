import { defineRouter } from '#q-app/wrappers'
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from 'vue-router'
import routes from './routes'
import { useAuthStore } from 'src/stores/auth'

export default defineRouter(function () {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE),
  })

  // 路由守衛：處理頁面存取權限
  Router.beforeEach((to, from, next) => {
    const auth = useAuthStore()

    // 進入需要登入的頁面但未登入
    if (to.meta.auth && !auth.isLoggedIn) {
      next('/login')
    }
    // 進入管理員頁面但權限不足
    else if (to.meta.admin && !auth.isAdmin) {
      next('/')
    }
    else {
      next()
    }
  })

  return Router
})
