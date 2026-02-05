const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      // --- 公開頁面 ---
      { path: '', component: () => import('pages/IndexPage.vue'), name: 'home' },
      { path: 'login', component: () => import('pages/LoginPage.vue'), name: 'login' },
      { path: 'register', component: () => import('pages/RegisterPage.vue'), name: 'register' },
      { path: 'events', component: () => import('pages/EventListPage.vue'), name: 'events' },

      // 將詳情頁移至此，方便管理，且確保所有人都能存取
      {
        path: 'events/:id',
        component: () => import('pages/EventDetailPage.vue'),
        name: 'event-detail',
      },

      // --- 志工需登入頁面 (auth: true) ---
      {
        path: 'my/profile',
        component: () => import('pages/MyProfilePage.vue'),
        meta: { auth: true },
      },
      {
        path: 'my/profile/edit',
        component: () => import('pages/ProfileEditPage.vue'),
        meta: { auth: true },
      },
      {
        path: 'my/applications',
        component: () => import('pages/MyApplicationsPage.vue'),
        meta: { auth: true },
      },
      {
        path: 'my/service-history',
        component: () => import('pages/ServiceHistoryPage.vue'),
        meta: { auth: true },
      },

      // --- 管理員專屬頁面 (auth: true, admin: true) ---
      {
        path: 'admin/dashboard',
        component: () => import('pages/AdminDashboardPage.vue'),
        meta: { auth: true, admin: true },
      },
      {
        path: 'admin/events',
        component: () => import('pages/AdminEventsPage.vue'),
        meta: { auth: true, admin: true },
      },
      {
        path: 'admin/events/create',
        component: () => import('pages/AdminEventCreatePage.vue'),
        meta: { auth: true, admin: true },
      },
      {
        path: 'admin/events/edit/:id',
        component: () => import('pages/AdminEventEditPage.vue'),
        meta: { auth: true, admin: true },
      },
      {
        path: 'admin/volunteers/:id',
        component: () => import('pages/MyProfilePage.vue'),
        name: 'admin-volunteer-profile',
        meta: { auth: true, admin: true },
      },
      {
        path: 'admin/tags',
        component: () => import('pages/AdminTagsPage.vue'),
        meta: { auth: true, admin: true },
      },
    ],
  },

  // 404 錯誤處理
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
