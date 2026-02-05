<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-md">
      <div class="text-h5 text-bold">活動報名管理</div>
      <q-space />
      <q-btn
        color="primary"
        icon="add"
        :label="$q.screen.gt.sm ? '發布新活動' : ''"
        outline
        to="/admin/events/create"
      />
    </div>

    <q-tabs
      v-model="tab"
      dense
      class="text-grey"
      :class="{ 'no-wrap': $q.screen.lt.md }"
      active-color="primary"
      indicator-color="primary"
      :align="$q.screen.gt.sm ? 'justify' : 'left'"
      narrow-indicator
    >
      <q-tab name="open" label="開放中活動" icon="event_available" />
      <q-tab name="closed" label="報名已截止 / 準備中" icon="event_busy" />
      <q-tab name="archived" label="已結束 / 歷史活動" icon="history" />
    </q-tabs>

    <q-separator />

    <div v-if="loading" class="text-center q-pa-xl">
      <q-spinner-dots color="primary" size="40px" />
    </div>

    <q-tab-panels v-else v-model="tab" animated class="bg-transparent q-mt-md">
      <!-- 開放中活動 Panel -->
      <q-tab-panel name="open" class="q-pa-none">
        <div v-if="openEvents.length === 0" class="text-center text-grey q-pa-md">
          尚無開放中活動
        </div>

        <div v-else class="row q-col-gutter-md">
          <div v-for="event in openEvents" :key="event._id" class="col-12">
            <q-card flat bordered class="shadow-1">
              <q-item>
                <q-item-section avatar>
                  <q-avatar rounded size="80px">
                    <img
                      :src="event.imgUrl || `https://picsum.photos/seed/${event._id}/800/600`"
                      style="object-fit: cover"
                    />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label
                    class="text-bold text-h6 cursor-pointer"
                    @click="$router.push(`/events/${event._id}`)"
                  >
                    {{ event.title }}
                  </q-item-label>
                  <q-item-label caption class="q-mt-xs">
                    <q-icon name="event" size="xs" />
                    {{ formatDate(event.serviceDateRange?.start, 'YYYY-MM-DD') }}
                    <span class="q-mx-xs">|</span>
                    <q-icon name="place" size="xs" /> {{ event.location }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-badge
                    :color="event.approvedCount >= event.maxParticipants ? 'negative' : 'positive'"
                    :label="event.approvedCount >= event.maxParticipants ? '已額滿' : '報名中'"
                    class="q-mb-xs"
                  />
                  <div class="text-caption text-grey">
                    {{ event.approvedCount }} / {{ event.maxParticipants }}
                  </div>
                </q-item-section>
              </q-item>
              <q-separator />
              <q-card-actions align="right">
                <q-btn
                  dense
                  flat
                  color="primary"
                  icon="people"
                  label="審核"
                  @click="openReviewDialog(event)"
                />
                <q-btn
                  dense
                  flat
                  color="secondary"
                  icon="edit"
                  label="編輯"
                  :to="`/admin/events/edit/${event._id}`"
                />
              </q-card-actions>
            </q-card>
          </div>
        </div>
      </q-tab-panel>

      <!-- 報名已截止 Panel -->
      <q-tab-panel name="closed" class="q-pa-none">
        <div v-if="registrationClosedEvents.length === 0" class="text-center text-grey q-pa-md">
          尚無此類活動
        </div>

        <div v-else class="row q-col-gutter-md">
          <div v-for="event in registrationClosedEvents" :key="event._id" class="col-12">
            <q-card flat bordered class="shadow-1 bg-orange-1">
              <q-item>
                <q-item-section avatar>
                  <q-avatar rounded size="80px">
                    <img
                      :src="event.imgUrl || `https://picsum.photos/seed/${event._id}/800/600`"
                      style="object-fit: cover"
                    />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label
                    class="text-bold text-h6 cursor-pointer"
                    @click="$router.push(`/events/${event._id}`)"
                  >
                    {{ event.title }}
                  </q-item-label>
                  <q-item-label caption class="q-mt-xs">
                    <q-icon name="event" size="xs" />
                    {{ formatDate(event.serviceDateRange?.start, 'YYYY-MM-DD') }}
                    <span class="q-mx-xs">|</span>
                    <q-icon name="place" size="xs" /> {{ event.location }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-badge color="orange" label="報名截止" class="q-mb-xs" />
                  <div class="text-caption text-grey">
                    {{ event.approvedCount }} / {{ event.maxParticipants }}
                  </div>
                </q-item-section>
              </q-item>
              <q-separator />
              <q-card-actions align="right">
                <q-btn
                  dense
                  flat
                  color="primary"
                  icon="people"
                  label="審核/點名"
                  @click="openReviewDialog(event)"
                />
                <q-btn
                  dense
                  flat
                  color="secondary"
                  icon="edit"
                  label="編輯"
                  :to="`/admin/events/edit/${event._id}`"
                />
              </q-card-actions>
            </q-card>
          </div>
        </div>
      </q-tab-panel>

      <!-- 已結束活動 Panel -->
      <q-tab-panel name="archived" class="q-pa-none">
        <div v-if="archivedEvents.length === 0" class="text-center text-grey q-pa-md">
          尚無歷史活動
        </div>

        <div v-else class="row q-col-gutter-md">
          <div v-for="event in archivedEvents" :key="event._id" class="col-12">
            <q-card flat bordered class="shadow-1 bg-grey-2">
              <q-item>
                <q-item-section avatar>
                  <q-avatar rounded size="80px">
                    <img
                      :src="event.imgUrl || `https://picsum.photos/seed/${event._id}/800/600`"
                      style="object-fit: cover; filter: grayscale(100%)"
                    />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-bold text-h6 text-grey-8">
                    {{ event.title }}
                  </q-item-label>
                  <q-item-label caption class="q-mt-xs">
                    <q-icon name="event" size="xs" />
                    {{ formatDate(event.serviceDateRange?.start, 'YYYY-MM-DD') }}
                    <span class="q-mx-xs">|</span>
                    <q-icon name="place" size="xs" /> {{ event.location }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-badge color="grey-7" label="已結案" class="q-mb-xs" />
                  <div class="text-caption text-grey">
                    {{ event.approvedCount }} / {{ event.maxParticipants }}
                  </div>
                </q-item-section>
              </q-item>
              <q-separator />
              <q-card-actions align="right">
                <q-btn
                  dense
                  flat
                  color="primary"
                  icon="people"
                  label="查看名單"
                  @click="openReviewDialog(event)"
                />
                <q-btn
                  dense
                  flat
                  color="grey-7"
                  icon="visibility"
                  label="查看內容"
                  :to="`/admin/events/edit/${event._id}`"
                />
              </q-card-actions>
            </q-card>
          </div>
        </div>
      </q-tab-panel>
    </q-tab-panels>

    <EventReviewDialog
      v-model="reviewDialog"
      :event="selectedEvent"
      @refresh="fetchEvents"
      @hide="onReviewDialogHide"
    />
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getEvents, getAllEvents, getEventById } from 'src/api/event'
import { useQuasar } from 'quasar'
import dayjs from 'dayjs'
import { formatDate } from 'src/utils/formatter.js'
import EventReviewDialog from 'src/components/EventReviewDialog.vue'

const $q = useQuasar()
const route = useRoute()
const router = useRouter()
const events = ref([])
const loading = ref(true)
const reviewDialog = ref(false)
const selectedEvent = ref(null)
const tab = ref('open')

const openEvents = computed(() => {
  const now = dayjs()
  return events.value.filter((e) => {
    const deadline = dayjs(e.registrationDeadline).endOf('day')
    const end = dayjs(e.serviceDateRange?.end)
    return deadline.isAfter(now) && end.isAfter(now)
  })
})

const registrationClosedEvents = computed(() => {
  const now = dayjs()
  return events.value
    .filter((e) => {
      const deadline = dayjs(e.registrationDeadline).endOf('day')
      const end = dayjs(e.serviceDateRange?.end)
      return deadline.isBefore(now) && end.isAfter(now)
    })
    .sort((a, b) => dayjs(a.serviceDateRange?.start).diff(dayjs(b.serviceDateRange?.start)))
})

const archivedEvents = computed(() => {
  const now = dayjs()
  return events.value
    .filter((e) => !dayjs(e.serviceDateRange?.end).isAfter(now))
    .sort((a, b) => dayjs(b.serviceDateRange?.end).diff(dayjs(a.serviceDateRange?.end)))
})

const onReviewDialogHide = () => {
  // 當審核對話框關閉時，如果 URL 中還存在 reviewEventId，就將其清除
  if (route.query.reviewEventId) {
    router.replace({ query: { ...route.query, reviewEventId: undefined } })
  }
}

const checkAndOpenReviewDialog = async () => {
  const eventId = route.query.reviewEventId
  if (!eventId) return

  let targetEvent = events.value.find((e) => e._id === eventId)

  if (!targetEvent) {
    try {
      const { data } = await getEventById(eventId)
      targetEvent = data.result
    } catch (e) {
      console.error('無法讀取指定活動', e)
    }
  }

  if (targetEvent) {
    await openReviewDialog(targetEvent)
    // URL 清除邏輯已移至 onReviewDialogHide
  }
}

const fetchEvents = async () => {
  try {
    const apiFunc = typeof getAllEvents === 'function' ? getAllEvents : getEvents
    const { data } = await apiFunc()
    events.value = data.result || []

    // 檢查網址是否有 reviewEventId 參數 (從儀表板跳轉過來)
    await checkAndOpenReviewDialog()
  } catch (error) {
    console.error('Fetch Events Error:', error)
    $q.notify({ color: 'negative', message: '讀取活動失敗' })
  } finally {
    loading.value = false
  }
}

const openReviewDialog = async (event) => {
  selectedEvent.value = event
  reviewDialog.value = true
}

// 監聽路由參數變化，確保在頁面未重新整理的情況下也能觸發
watch(
  () => route.query.reviewEventId,
  (newId) => {
    if (newId) checkAndOpenReviewDialog()
  },
)

onMounted(fetchEvents)
</script>

<style scoped>
/* 強制在小螢幕 (xs) 隱藏箭頭並開啟捲動，解決電腦版縮小視窗時仍顯示箭頭的問題 */
@media (max-width: 599px) {
  :deep(.q-tabs__arrow) {
    display: none;
  }
  :deep(.q-tabs__content) {
    overflow-x: auto;
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE/Edge */
  }
  :deep(.q-tabs__content)::-webkit-scrollbar {
    display: none; /* Chrome/Safari */
  }
}
</style>
