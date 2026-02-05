<template>
  <q-page class="q-pa-md">
    <div class="text-h5 text-bold q-mb-md">管理後台</div>

    <div v-if="loading" class="row justify-center q-pa-xl">
      <q-spinner-dots color="primary" size="40px" />
    </div>

    <div v-else>
      <!-- KPI Cards -->
      <div class="row q-col-gutter-md q-mb-lg">
        <div class="col-12 col-sm-6 col-md-3">
          <q-card flat bordered class="full-height bg-blue-1">
            <q-card-section class="row items-center justify-between q-pb-none">
              <div class="text-subtitle2 text-grey-8">總志工人數</div>
              <q-icon name="group" color="primary" size="24px" />
            </q-card-section>
            <q-card-section>
              <div class="text-h4 text-bold text-primary">{{ stats.totalVolunteers }}</div>
              <div class="text-caption text-grey-7">平台註冊會員總數</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <q-card flat bordered class="full-height bg-green-1">
            <q-card-section class="row items-center justify-between q-pb-none">
              <div class="text-subtitle2 text-grey-8">累積服務時數</div>
              <q-icon name="volunteer_activism" color="green" size="24px" />
            </q-card-section>
            <q-card-section>
              <div class="text-h4 text-bold text-green">{{ stats.totalHours }}</div>
              <div class="text-caption text-grey-7">小時</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <q-card flat bordered class="full-height bg-orange-1">
            <q-card-section class="row items-center justify-between q-pb-none">
              <div class="text-subtitle2 text-grey-8">進行中活動</div>
              <q-icon name="event" color="orange" size="24px" />
            </q-card-section>
            <q-card-section>
              <div class="text-h4 text-bold text-orange">{{ stats.activeEvents }}</div>
              <div class="text-caption text-grey-7">目前開放報名或進行中</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <q-card flat bordered class="full-height bg-red-1">
            <q-card-section class="row items-center justify-between q-pb-none">
              <div class="text-subtitle2 text-grey-8">待審核申請</div>
              <q-icon name="assignment_ind" color="red" size="24px" />
            </q-card-section>
            <q-card-section>
              <div class="text-h4 text-bold text-red">{{ stats.pendingApplications }}</div>
              <div class="text-caption text-grey-7">需要立即處理</div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <div class="row q-col-gutter-md">
        <!-- Recent Applications -->
        <div class="col-12 col-md-8">
          <q-card flat bordered class="full-height">
            <q-card-section class="row items-center">
              <div class="text-h6">最新報名申請</div>
              <q-space />
              <q-btn
                flat
                color="primary"
                label="前往審核"
                to="/admin/events"
                icon-right="arrow_forward"
              />
            </q-card-section>
            <q-separator />
            <q-list separator>
              <q-item v-if="recentApplications.length === 0">
                <q-item-section class="text-center text-grey q-pa-md">目前無新申請</q-item-section>
              </q-item>
              <q-item
                v-for="app in recentApplications"
                :key="app._id"
                clickable
                v-ripple
                @click="goToEventReview(app.event?._id)"
              >
                <q-item-section avatar>
                  <q-avatar>
                    <img
                      :src="
                        app.user?.avatar ||
                        `https://api.dicebear.com/9.x/thumbs/svg?seed=${app.user?.account}`
                      "
                    />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-bold">{{ app.user?.name }}</q-item-label>
                  <q-item-label caption>申請活動：{{ app.event?.title }}</q-item-label>
                  <q-item-label
                    v-if="app.note"
                    class="text-blue-9 text-caption q-mt-xs bg-blue-1 q-pa-xs rounded-borders"
                    style="width: fit-content"
                  >
                    <q-icon name="sticky_note_2" /> 備註：{{ app.note }}
                  </q-item-label>
                  <q-tooltip>點擊前往審核頁面</q-tooltip>
                </q-item-section>
                <q-item-section side>
                  <div class="text-caption q-mb-xs">{{ formatDate(app.createdAt) }}</div>
                  <div v-if="app.status === 'pending'" class="row q-gutter-xs">
                    <q-btn
                      flat
                      round
                      dense
                      color="positive"
                      icon="check"
                      @click.stop="onQuickApprove(app)"
                    >
                      <q-tooltip>快速錄取</q-tooltip>
                    </q-btn>
                    <q-btn
                      flat
                      round
                      dense
                      color="negative"
                      icon="close"
                      @click.stop="onQuickReject(app)"
                    >
                      <q-tooltip>拒絕</q-tooltip>
                    </q-btn>
                  </div>
                  <q-badge
                    v-else
                    :color="getStatusColor(app.status)"
                    :label="getStatusLabel(app.status)"
                  />
                </q-item-section>
              </q-item>
            </q-list>
          </q-card>
        </div>

        <!-- Popular Skills -->
        <div class="col-12 col-md-4">
          <q-card flat bordered class="full-height">
            <q-card-section>
              <div class="text-h6">熱門志工技能分佈</div>
            </q-card-section>
            <q-separator />
            <q-card-section style="max-height: 300px; overflow-y: auto">
              <div v-if="popularSkills.length === 0" class="text-center text-grey">尚無數據</div>
              <div v-else v-for="(skill, index) in popularSkills" :key="index" class="q-mb-md">
                <div class="row justify-between q-mb-xs">
                  <span class="text-bold">{{ skill.name }}</span>
                  <span class="text-grey">{{ skill.count }} 人</span>
                </div>
                <q-linear-progress :value="skill.percentage" color="secondary" rounded size="8px" />
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { formatDate } from 'src/utils/formatter.js'
import { useQuasar } from 'quasar'
import { getAdminDashboardStats } from 'src/api/user'
import { updateApplicationStatus } from 'src/api/application'

const $q = useQuasar()
const router = useRouter()
const loading = ref(true)
const stats = ref({
  totalVolunteers: 0,
  totalHours: 0,
  activeEvents: 0,
  pendingApplications: 0,
})
const recentApplications = ref([])
const popularSkills = ref([])

const fetchDashboard = async () => {
  try {
    const { data } = await getAdminDashboardStats()
    if (data.success) {
      stats.value = data.result.stats || stats.value
      recentApplications.value = data.result.recentApplications || []
      popularSkills.value = data.result.popularSkills || []
    }
  } catch (error) {
    console.error('Fetch dashboard failed', error)
    $q.notify({ color: 'negative', message: '無法讀取儀表板數據' })
  } finally {
    loading.value = false
  }
}

const goToEventReview = (eventId) => {
  if (!eventId) return
  router.push({ path: '/admin/events', query: { reviewEventId: eventId } })
}

const getStatusColor = (status) => {
  const map = { approved: 'green', rejected: 'red', cancelled: 'grey' }
  return map[status] || 'grey'
}

const getStatusLabel = (status) => {
  const map = { approved: '已錄取', rejected: '已拒絕', cancelled: '已取消' }
  return map[status] || status
}

const onQuickApprove = async (app) => {
  try {
    await updateApplicationStatus(app._id, { status: 'approved' })
    $q.notify({ type: 'positive', message: '已錄取' })
    fetchDashboard()
  } catch (error) {
    console.error(error)
  }
}

const onQuickReject = (app) => {
  $q.dialog({
    title: '拒絕申請',
    message: '請輸入拒絕原因（此原因將會通知申請者）：',
    prompt: {
      model: '',
      type: 'textarea',
      isValid: (val) => val.length > 0,
      placeholder: '例如：資格不符、名額已滿...',
    },
    cancel: true,
    persistent: true,
  }).onOk(async (reason) => {
    try {
      await updateApplicationStatus(app._id, { status: 'rejected', reviewComment: reason })
      $q.notify({ type: 'positive', message: '已拒絕並發送通知' })
      fetchDashboard()
    } catch (error) {
      console.error(error)
    }
  })
}

onMounted(fetchDashboard)
</script>
