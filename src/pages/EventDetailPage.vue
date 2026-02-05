<template>
  <q-page class="bg-grey-2" v-if="loading">
    <div class="flex flex-center" style="height: 80vh">
      <q-spinner-dots color="primary" size="40px" />
    </div>
  </q-page>

  <q-page class="bg-grey-1" style="padding-bottom: 80px" v-else-if="event">
    <div class="main-container q-pa-md">
      <!-- Breadcrumbs and Back Button -->
      <div class="row items-center text-grey-7 q-mb-sm">
        <q-btn flat round icon="arrow_back" to="/events" class="q-mr-sm" />
        <q-breadcrumbs>
          <q-breadcrumbs-el label="活動列表" to="/events" />
          <q-breadcrumbs-el :label="event.title" class="ellipsis" style="max-width: 200px" />
        </q-breadcrumbs>
      </div>

      <div class="row q-col-gutter-x-xl q-col-gutter-y-md">
        <!-- Left Column: Main Content -->
        <div class="col-12 col-lg-8">
          <!-- Event Header -->
          <div class="q-mb-lg">
            <h1 class="text-h3 text-bold q-mt-none q-mb-sm leading-snug">{{ event.title }}</h1>
            <div class="row items-center q-gutter-sm q-mb-sm">
              <q-badge
                :color="getCategoryColor(event.category?.name)"
                class="q-pa-sm text-subtitle2"
              >
                {{ event.category?.name || '活動分類' }}
              </q-badge>
              <q-badge
                :color="getVolunteerTypeColor(event.volunteerType?.name)"
                class="q-pa-sm text-subtitle2"
              >
                {{ event.volunteerType?.name || '一般志工' }}
              </q-badge>
            </div>
            <div class="text-caption text-grey-7 q-mb-xs">
              發布於 {{ formatDate(event.createdAt) }}
            </div>
          </div>

          <!-- Event Image -->
          <q-card flat bordered class="q-mb-lg">
            <q-img
              :src="event.imgUrl || `https://picsum.photos/seed/${event._id}/1200/600`"
              :ratio="16 / 9"
            />
          </q-card>

          <!-- Participation Info -->
          <q-card flat bordered class="q-mb-lg">
            <q-card-section>
              <div class="text-h6">參與資訊</div>
            </q-card-section>
            <q-separator />
            <q-card-section class="q-gutter-y-lg">
              <div>
                <div class="text-subtitle1 text-bold text-primary row items-center q-mb-sm">
                  <q-icon name="psychology" class="q-mr-sm" /> 所需技能
                </div>
                <div class="row q-gutter-sm">
                  <q-chip
                    v-for="(skill, index) in event.requiredSkills"
                    :key="index"
                    :color="isUserHasSkill(skill.name || skill) ? 'positive' : 'blue-1'"
                    :text-color="isUserHasSkill(skill.name || skill) ? 'white' : 'blue-9'"
                    :icon="isUserHasSkill(skill.name || skill) ? 'check' : 'bolt'"
                    size="md"
                  >
                    {{ skill.name || skill }}
                  </q-chip>
                  <div
                    v-if="!event.requiredSkills || event.requiredSkills.length === 0"
                    class="text-grey"
                  >
                    不限任何技能，歡迎您的熱情參與！
                  </div>
                </div>
              </div>
            </q-card-section>
            <q-separator inset />
            <q-card-section>
              <div class="text-subtitle1 text-bold text-primary row items-center q-mb-sm">
                <q-icon name="face" class="q-mr-sm" /> 服務對象
              </div>
              <div class="text-body1">{{ event.serviceTarget || '未指定' }}</div>
            </q-card-section>
            <q-separator inset />
            <q-card-section>
              <div class="text-subtitle1 text-bold text-primary row items-center q-mb-sm">
                <q-icon name="schedule" class="q-mr-sm" /> 服務時段
              </div>
              <div
                v-if="event.serviceSlots && event.serviceSlots.length > 0"
                class="row q-gutter-sm"
              >
                <q-chip
                  v-for="slot in event.serviceSlots"
                  :key="slot._id"
                  color="grey-2"
                  text-color="grey-9"
                  icon="access_time"
                  size="md"
                >
                  {{ slot.name }}
                </q-chip>
              </div>
              <div v-else class="text-grey">無特定時段要求</div>
            </q-card-section>
          </q-card>

          <!-- Event Description -->
          <q-card flat bordered>
            <q-card-section>
              <div class="text-h6">活動詳情</div>
            </q-card-section>
            <q-separator />
            <q-card-section class="text-body1 text-grey-9 content-style">
              <div v-html="event.description" />
            </q-card-section>
          </q-card>
        </div>

        <!-- Right Column: Sticky Sidebar (Desktop) -->
        <div class="col-12 col-lg-4">
          <div class="sticky-card">
            <q-card flat bordered>
              <q-card-section :class="scoreColor" class="text-white text-center">
                <div class="text-subtitle1 text-weight-bold">智慧媒合分析</div>
                <div class="q-my-sm">
                  <q-knob
                    readonly
                    :model-value="matchScore"
                    size="100px"
                    :thickness="0.15"
                    color="white"
                    track-color="white-opacity"
                    class="text-h5 text-weight-bolder"
                    show-value
                  >
                    <q-icon v-if="!auth.isLoggedIn" name="lock" size="30px" />
                    <span v-else>{{ matchScore }}%</span>
                  </q-knob>
                </div>
                <div class="text-h6 q-mb-xs">{{ scoreMessage.title }}</div>
                <div class="text-caption opacity-80">{{ scoreMessage.sub }}</div>
              </q-card-section>

              <q-list separator>
                <q-item>
                  <q-item-section avatar>
                    <q-icon name="timer" color="negative" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label caption>報名截止</q-item-label>
                    <q-item-label class="text-bold text-negative">
                      {{ formatDate(event.registrationDeadline) }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section avatar>
                    <q-icon name="event" color="primary" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label caption>活動時間</q-item-label>
                    <q-item-label class="text-bold">{{ formattedServiceDate }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item clickable @click="openMap(event.location)">
                  <q-item-section avatar>
                    <q-icon name="place" color="primary" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label caption>活動地點</q-item-label>
                    <q-item-label class="text-bold ellipsis">{{ event.location }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section avatar>
                    <q-icon name="hourglass_top" color="primary" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label caption>核發時數</q-item-label>
                    <q-item-label class="text-bold">{{ event.hours }} 小時</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>

              <q-card-section>
                <div class="q-mb-md">
                  <div class="row items-center justify-between text-caption q-mb-xs">
                    <span class="text-grey-7">錄取進度</span>
                    <span class="text-bold">
                      {{ event.approvedCount || 0 }} / {{ event.maxParticipants }}
                    </span>
                  </div>
                  <q-linear-progress
                    :value="registrationProgress"
                    color="primary"
                    size="10px"
                    rounded
                    track-color="grey-3"
                  />
                </div>
                <q-btn
                  unelevated
                  :color="isBtnDisabled ? 'grey-7' : 'primary'"
                  :label="btnLabel"
                  :disable="isBtnDisabled"
                  size="lg"
                  class="full-width text-bold"
                  :loading="submitting"
                  @click="openJoinDialog"
                  icon="add_circle_outline"
                />
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>
    </div>
  </q-page>

  <q-page v-else class="flex flex-center text-center q-pa-md bg-grey-2">
    <div>
      <q-icon name="event_busy" size="100px" color="grey-5" />
      <div class="text-h5 q-mt-md text-grey-8">找不到活動</div>
      <div class="text-body1 text-grey-6 q-mt-sm">
        您所尋找的活動可能不存在、已被刪除或網址不正確。
      </div>
      <q-btn to="/events" label="返回活動列表" color="primary" unelevated class="q-mt-lg" />
    </div>
  </q-page>

  <q-dialog v-model="showJoinDialog">
    <q-card style="min-width: 350px">
      <q-card-section>
        <div class="text-h6">確認報名</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <div class="q-mb-md text-body1">
          您即將報名活動：<span class="text-weight-bold">{{ event?.title }}</span>
        </div>
        <q-input
          v-model="joinNote"
          label="備註 (選填)"
          placeholder="例如：飲食習慣、特殊需求、自行前往..."
          filled
          type="textarea"
          rows="3"
          autofocus
        />
      </q-card-section>

      <q-card-actions align="right" class="text-primary">
        <q-btn flat label="取消" v-close-popup />
        <q-btn flat label="確認送出" @click="handleJoin" :loading="submitting" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

import { useRoute } from 'vue-router'
import { useAuthStore } from 'src/stores/auth'
import { useQuasar } from 'quasar'
import dayjs from 'dayjs'
import { getEventById, joinEvent } from 'src/api/event'
import { getMyApplications } from 'src/api/application'
import { formatDate } from 'src/utils/formatter.js'
import {
  getCategoryColor,
  getVolunteerTypeColor,
  getMatchScoreColor,
} from 'src/utils/tag-colors.js'
import { useMatchScore } from 'src/composables/useMatchScore.js'

const route = useRoute()
const auth = useAuthStore()
const $q = useQuasar()

const event = ref(null)
const myApps = ref([])
const loading = ref(true)
const submitting = ref(false)
const showJoinDialog = ref(false)
const joinNote = ref('')
const { matchScore } = useMatchScore(event)

const openMap = (address) => {
  if (!address) return
  window.open(
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`,
    '_blank',
  )
}

const isUserHasSkill = (skillName) => {
  const userSkills = auth.user.skills || []
  return userSkills.some((s) => (typeof s === 'object' ? s.name : String(s)) === String(skillName))
}

const registrationProgress = computed(() => {
  if (!event.value || !event.value.maxParticipants) return 0
  return (event.value.approvedCount || 0) / event.value.maxParticipants
})

const scoreColor = computed(() => {
  if (!auth.isLoggedIn) return 'bg-blue-grey-7'
  return `bg-${getMatchScoreColor(matchScore.value)}`
})

const scoreMessage = computed(() => {
  if (!auth.isLoggedIn) return { title: '訪客瀏覽', sub: '登入後即可查看技能媒合分析' }
  if (matchScore.value >= 80) return { title: '完美契合', sub: '您的技能正是這個活動需要的！' }
  if (matchScore.value >= 40) return { title: '適配良好', sub: '您已具備核心能力。' }
  return { title: '勇於嘗試', sub: '這是一個學習的好機會！' }
})

const formattedServiceDate = computed(() => {
  const start = event.value?.serviceDateRange?.start
  const end = event.value?.serviceDateRange?.end

  if (!start) return '未提供服務時間'

  const startDate = dayjs(start)

  if (!end || !dayjs(end).isValid()) {
    return startDate.format('YYYY/MM/DD HH:mm')
  }

  const endDate = dayjs(end)

  if (startDate.isSame(endDate, 'day')) {
    return `${startDate.format('YYYY/MM/DD')} ${startDate.format('HH:mm')} - ${endDate.format('HH:mm')}`
  }
  return `${startDate.format('YYYY/MM/DD HH:mm')} - ${endDate.format('YYYY/MM/DD HH:mm')}`
})

// 找出當前用戶對此活動的具體申請紀錄
const currentApp = computed(() =>
  myApps.value.find((app) => (app.event?._id || app.event) === route.params.id),
)

// 判斷是否「有效報名中」（排除已取消或被拒絕的狀態）
const isAlreadyJoined = computed(() => {
  if (!currentApp.value) return false
  return !['cancelled', 'rejected'].includes(currentApp.value.status)
})

const isDeadlinePassed = computed(() => {
  if (!event.value) return false
  const deadline = event.value.registrationDeadline || event.value.serviceDateRange?.start
  return dayjs().isAfter(dayjs(deadline).endOf('day'))
})

const isFull = computed(() => {
  if (!event.value) return false
  return (event.value.approvedCount || 0) >= event.value.maxParticipants
})

const isBtnDisabled = computed(
  () => !auth.isLoggedIn || isAlreadyJoined.value || isDeadlinePassed.value || isFull.value,
)

const btnLabel = computed(() => {
  if (!auth.isLoggedIn) return '請先登入以報名'
  if (isAlreadyJoined.value) return '您已報名此活動'
  if (isDeadlinePassed.value) return '報名已截止'
  if (isFull.value) return '錄取名額已滿'
  // 若有紀錄但非有效報名狀態（如被拒絕），顯示重新報名
  if (currentApp.value && ['cancelled', 'rejected'].includes(currentApp.value.status))
    return '重新報名'
  return '立即報名'
})

const openJoinDialog = () => {
  joinNote.value = ''
  showJoinDialog.value = true
}

const handleJoin = async () => {
  submitting.value = true
  try {
    await joinEvent(event.value._id, joinNote.value)
    const successMsg = currentApp.value ? '重新提交報名申請成功' : '報名成功，請靜待管理員審核'
    $q.notify({ color: 'positive', message: successMsg, icon: 'check_circle' })

    const [evRes, appRes] = await Promise.all([getEventById(route.params.id), getMyApplications()])
    event.value = evRes.data.result
    myApps.value = appRes.data.result
  } catch (error) {
    $q.notify({ color: 'negative', message: error.response?.data?.message || '報名失敗' })
  } finally {
    submitting.value = false
    showJoinDialog.value = false
  }
}

onMounted(async () => {
  try {
    const [evRes, appRes] = await Promise.all([
      getEventById(route.params.id),
      auth.isLoggedIn ? getMyApplications() : { data: { result: [] } },
    ])
    event.value = evRes.data.result
    myApps.value = appRes.data.result
  } catch (error) {
    console.error('載入活動詳情失敗', error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.main-container {
  max-width: 1200px;
  margin: 0 auto;
}
.white-opacity {
  background: rgba(255, 255, 255, 0.2);
}
.sticky-card {
  position: sticky;
  top: 20px;
  z-index: 10;
}
.opacity-80 {
  opacity: 0.8;
}
.leading-snug {
  line-height: 1.2;
}
.content-style {
  line-height: 1.8;
}
/* 讓 q-editor 產生的內容有更好看的樣式 */
.content-style :deep(h1),
.content-style :deep(h2),
.content-style :deep(h3) {
  font-weight: bold;
  margin-bottom: 1rem;
  line-height: 1.3;
}
.content-style :deep(p) {
  margin-bottom: 1rem;
}
.content-style :deep(ul),
.content-style :deep(ol) {
  padding-left: 2rem;
  margin-bottom: 1rem;
}
.content-style :deep(a) {
  color: #1976d2;
  text-decoration: none;
}
.content-style :deep(a:hover) {
  text-decoration: underline;
}

@media (max-width: 1023px) {
  /* Corresponds to 'lg' breakpoint in Quasar */
  .sticky-card {
    position: relative;
    top: 0;
  }
}
</style>
