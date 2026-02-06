<template>
  <q-layout view="hHh Lpr lff">
    <q-header elevated :class="headerClass" style="z-index: 4000">
      <q-toolbar>
        <!-- 漢堡選單：小尺寸螢幕顯示 (lt-md)，大尺寸隱藏 -->
        <q-btn flat dense round icon="menu" class="lt-md q-mr-sm" @click="toggleLeftDrawer()" />

        <q-toolbar-title class="text-bold ellipsis row items-center q-pl-none">
          <div class="row no-wrap items-center">
            <div class="row no-wrap items-center cursor-pointer" @click="router.push('/')">
              <img
                :src="logoImg"
                style="height: 40px; width: auto"
                class="gt-xs q-mr-md"
                alt="V-Link"
              />
              <span class="text-h6 text-weight-bold gt-xs">智慧志工</span>
              <span class="text-h6 text-weight-bold lt-sm">V-LINK</span>
            </div>
            <span
              v-if="$q.screen.gt.sm"
              class="q-ml-md text-grey-3 gt-sm flex items-center"
              style="
                font-size: 13px;
                font-weight: normal;
                letter-spacing: 1px;
                opacity: 0.9;
                border-left: 1px solid rgba(255, 255, 255, 0.3);
                padding-left: 12px;
                height: 28px;
              "
            >
              {{ subtitle }}
            </span>
          </div>
        </q-toolbar-title>

        <q-space />

        <!-- 前台導航連結：直接顯示在 Navbar -->
        <div v-if="!isBackend" class="row items-center q-gutter-sm q-mr-md gt-sm">
          <q-btn flat label="活動探索" to="/events" />
        </div>

        <div class="row items-center q-gutter-sm">
          <template v-if="!auth.isLoggedIn">
            <q-btn flat label="登入" to="/login" />
            <q-btn color="white" text-color="primary" label="註冊" to="/register" />
          </template>

          <template v-else>
            <!-- 通知中心按鈕 -->
            <q-btn round dense flat color="white" icon="notifications">
              <q-badge v-if="unreadCount > 0" color="red" floating rounded>{{
                unreadCount
              }}</q-badge>
              <q-menu anchor="bottom right" self="top right" max-width="350px" :offset="[0, 8]">
                <q-list bordered padding style="min-width: 300px">
                  <q-item-label header>通知中心</q-item-label>

                  <div v-if="notifications.length === 0" class="text-center q-pa-md text-grey">
                    <q-icon name="notifications_off" size="30px" />
                    <div class="text-caption q-mt-xs">目前沒有新通知</div>
                  </div>

                  <q-item
                    v-for="notif in notifications"
                    :key="notif._id"
                    clickable
                    v-ripple
                    :class="{ 'bg-blue-1': !notif.isRead }"
                    @click="handleNotificationClick(notif)"
                  >
                    <q-item-section avatar>
                      <q-icon :name="getNotifIcon(notif.type)" :color="getNotifColor(notif.type)" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-weight-bold">{{ notif.title }}</q-item-label>
                      <q-item-label caption lines="2">{{ notif.content }}</q-item-label>
                      <q-item-label caption class="text-grey-6" style="font-size: 12px">
                        {{ new Date(notif.createdAt).toLocaleString() }}
                      </q-item-label>
                    </q-item-section>
                    <q-item-section side top v-if="!notif.isRead">
                      <q-badge color="red" rounded p size="6px" />
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>

            <div class="gt-xs q-mr-sm text-bold">
              {{ auth.user.name }}
            </div>
            <q-avatar
              size="32px"
              class="cursor-pointer q-mr-sm"
              @click="router.push('/my/profile')"
            >
              <img :src="auth.user.avatar" />
              <q-tooltip>前往個人檔案</q-tooltip>
            </q-avatar>

            <q-btn flat round dense icon="logout" @click="handleLogout">
              <q-tooltip>登出</q-tooltip>
            </q-btn>
          </template>
        </div>
      </q-toolbar>
    </q-header>

    <!-- 側邊欄：只在後台模式顯示 -->
    <q-drawer v-model="leftDrawerOpen" :show-if-above="isBackend" bordered class="bg-grey-1">
      <q-list>
        <q-item-label header>平台導覽</q-item-label>
        <q-item clickable v-ripple to="/">
          <q-item-section avatar><q-icon name="home" /></q-item-section>
          <q-item-section>回到首頁</q-item-section>
        </q-item>
        <q-item clickable v-ripple to="/events">
          <q-item-section avatar><q-icon name="explore" /></q-item-section>
          <q-item-section>活動探索</q-item-section>
        </q-item>
        <q-separator spaced />

        <template v-if="auth.isLoggedIn">
          <q-item-label header>個人管理</q-item-label>
          <q-item clickable v-ripple to="/my/applications">
            <q-item-section avatar><q-icon name="assignment" /></q-item-section>
            <q-item-section>我的申請</q-item-section>
          </q-item>
          <q-item clickable v-ripple to="/my/service-history">
            <q-item-section avatar><q-icon name="history" /></q-item-section>
            <q-item-section>服務歷程</q-item-section>
          </q-item>
        </template>

        <template v-if="auth.isAdmin">
          <q-separator spaced />
          <q-item-label header class="text-red">系統管理</q-item-label>
          <q-item clickable v-ripple to="/admin/dashboard">
            <q-item-section avatar><q-icon name="dashboard" color="red" /></q-item-section>
            <q-item-section>管理後台</q-item-section>
          </q-item>
          <q-item clickable v-ripple to="/admin/events">
            <q-item-section avatar><q-icon name="settings" color="red" /></q-item-section>
            <q-item-section>活動控管</q-item-section>
          </q-item>
          <q-item clickable v-ripple to="/admin/tags">
            <q-item-section avatar><q-icon name="style" color="red" /></q-item-section>
            <q-item-section>標籤維護</q-item-section>
          </q-item>
        </template>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- Footer Section: 根據頁面類型顯示不同樣式 -->
    <q-footer v-if="!isAdminPage" :class="footerClass" :bordered="isMemberPage">
      <!-- 情境 A: 一般前台頁面 (完整版 Footer，已縮減尺寸) -->
      <div v-if="!isMemberPage" class="q-py-lg">
        <div class="container q-mx-auto q-px-md" style="max-width: 1200px">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-4">
              <div class="text-subtitle1 text-bold q-mb-sm flex items-center">
                <q-icon name="volunteer_activism" size="xs" class="q-mr-sm" />
                V-Link 智慧志工
              </div>
              <div class="text-caption text-grey-5" style="line-height: 1.6">
                致力於連結志工熱情與社會需求，打造最便捷的智慧媒合平台。
              </div>
            </div>
            <div class="col-12 col-md-4">
              <div class="text-subtitle1 text-bold q-mb-sm">快速連結</div>
              <div class="column q-gutter-xs text-caption">
                <router-link to="/" class="text-grey-5 hover-text-white text-decoration-none"
                  >回到首頁</router-link
                >
                <router-link to="/events" class="text-grey-5 hover-text-white text-decoration-none"
                  >探索活動</router-link
                >
                <router-link
                  :to="auth.isLoggedIn ? '/my/applications' : '/login'"
                  class="text-grey-5 hover-text-white text-decoration-none"
                  >{{ auth.isLoggedIn ? '會員中心' : '登入/註冊' }}</router-link
                >
              </div>
            </div>
            <div class="col-12 col-md-4">
              <div class="text-subtitle1 text-bold q-mb-sm">聯絡我們</div>
              <div class="column q-gutter-xs text-caption text-grey-5">
                <div class="flex items-center">
                  <q-icon name="email" class="q-mr-sm" /> contact@vlink.tw
                </div>
                <div class="flex items-center">
                  <q-icon name="phone" class="q-mr-sm" /> 02-2345-6789
                </div>
                <div class="flex items-center">
                  <q-icon name="location_on" class="q-mr-sm" /> 台北市信義區信義路五段7號
                </div>
              </div>
            </div>
          </div>
          <q-separator color="grey-8" class="q-my-md" />
          <div class="row justify-between items-center text-caption text-grey-6">
            <div>
              &copy; {{ currentYear }} V-Link 智慧志工平台 | ChocoLeLe | 泰山職訓網頁設計專題
            </div>
            <div class="flex q-gutter-sm">
              <q-btn flat round dense icon="facebook" size="sm" />
              <q-btn flat round dense icon="language" size="sm" />
            </div>
          </div>
        </div>
      </div>

      <!-- 情境 B: 會員後台 (極簡版 Footer) -->
      <div v-else class="q-py-sm text-center">
        <div class="text-caption">
          &copy; {{ currentYear }} V-Link 智慧志工平台 | ChocoLeLe | 泰山職訓網頁設計專題
        </div>
      </div>
    </q-footer>
  </q-layout>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useAuthStore } from 'src/stores/auth'
import { useRouter, useRoute } from 'vue-router'
import { getMyNotifications, markNotificationRead } from 'src/api/application'
import { useQuasar } from 'quasar'
import logoImg from 'src/assets/img/logo.svg'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const leftDrawerOpen = ref(false)
const notifications = ref([])
let pollingTimer = null
const $q = useQuasar()
const currentYear = new Date().getFullYear()

// 判斷是否為後台頁面 (路徑以 /my 或 /admin 開頭)
const isBackend = computed(() => {
  return route.path.startsWith('/my') || route.path.startsWith('/admin')
})

const isAdminPage = computed(() => route.path.startsWith('/admin'))
const isMemberPage = computed(() => route.path.startsWith('/my'))

const subtitle = computed(() => {
  if (isAdminPage.value) {
    return '管理後台'
  }
  if (isMemberPage.value) {
    return '個人後台'
  }
  return '推薦最適合你的志工服務'
})

const headerClass = computed(() => {
  if (isAdminPage.value) return 'bg-red-9 text-white' // 管理員後台：紅色
  return 'bg-primary text-white' // 前台與會員中心：主色調 (藍色)
})

const footerClass = computed(() => {
  // 會員中心：淺色極簡風格 (白底灰字)
  if (isMemberPage.value) return 'bg-white text-grey-7'
  // 前台：深色完整風格 (維持深色但更緊湊)
  return 'bg-blue-grey-10 text-white'
})

const unreadCount = computed(() => notifications.value.filter((n) => !n.isRead).length)

const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

const handleLogout = () => {
  if (pollingTimer) clearInterval(pollingTimer)
  auth.logout()
  router.push('/login')
}

const fetchNotifications = async () => {
  if (!auth.isLoggedIn) return
  try {
    const { data } = await getMyNotifications()
    notifications.value = data.result || []
  } catch (error) {
    console.error('Fetch notifications failed', error)
  }
}

const handleNotificationClick = async (notif) => {
  // 標記為已讀
  if (!notif.isRead) {
    try {
      await markNotificationRead(notif._id)
      notif.isRead = true
    } catch (e) {
      console.error(e)
    }
  }
  // 判斷跳轉目標頁籤 (rejected/cancelled -> closed, approved -> active)
  const targetTab = ['rejected', 'cancelled'].includes(notif.type) ? 'closed' : 'approved'

  router.push({ path: '/my/applications', query: { tab: targetTab } })
}

// 輔助函式：根據通知類型回傳圖示
const getNotifIcon = (type) => {
  const map = {
    approved: 'check_circle',
    rejected: 'cancel',
    cancelled: 'event_busy',
    system: 'info',
    info: 'notifications',
  }
  return map[type] || 'notifications'
}

// 輔助函式：根據通知類型回傳顏色
const getNotifColor = (type) => {
  const map = {
    approved: 'positive',
    rejected: 'negative',
    cancelled: 'grey-7',
    system: 'primary',
    info: 'info',
  }
  return map[type] || 'grey'
}

// 監聽路由變化，在手機版切換頁面時自動關閉側邊欄
watch(
  () => route.path,
  () => {
    if ($q.screen.lt.md && leftDrawerOpen.value) {
      leftDrawerOpen.value = false
    }
  },
)

// 監聽後台模式切換，確保進入後台時手機版側邊欄預設關閉 (防止殘留狀態)
watch(isBackend, (val) => {
  if (val && $q.screen.lt.md) {
    leftDrawerOpen.value = false
  }
})

// 監聽登入狀態，確保登入後自動開始輪詢，登出後停止
watch(
  () => auth.isLoggedIn,
  (loggedIn) => {
    if (loggedIn) {
      fetchNotifications()
      if (!pollingTimer) pollingTimer = setInterval(fetchNotifications, 10000)
    } else {
      if (pollingTimer) clearInterval(pollingTimer)
      pollingTimer = null
      notifications.value = []
    }
  },
)

onMounted(() => {
  if (auth.isLoggedIn) {
    fetchNotifications()
    // 每 10 秒自動檢查一次新通知
    pollingTimer = setInterval(fetchNotifications, 10000)
  }
})

onUnmounted(() => {
  if (pollingTimer) clearInterval(pollingTimer)
})
</script>

<style>
.text-decoration-none {
  text-decoration: none;
}

.hover-text-white:hover {
  color: white !important;
  transition: color 0.3s;
}

.q-tooltip,
.q-badge,
.q-chip {
  font-size: 12px !important;
}
</style>
