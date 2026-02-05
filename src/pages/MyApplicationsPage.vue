<template>
  <q-page class="q-pa-md">
    <div class="text-h5 text-bold q-mb-md">我的申請紀錄</div>

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
      <q-tab name="pending" label="進行中" />
      <q-tab name="approved" label="已錄取" />
      <q-tab name="closed" label="未錄取/取消" />
    </q-tabs>

    <q-separator />

    <div v-if="loading" class="text-center q-pa-xl">
      <q-spinner-dots color="primary" size="40px" />
    </div>

    <q-tab-panels v-else v-model="tab" animated class="bg-transparent q-mt-md">
      <q-tab-panel
        v-for="targetTab in ['pending', 'approved', 'closed']"
        :key="targetTab"
        :name="targetTab"
        class="q-pa-none"
      >
        <div v-if="getFilteredApps(targetTab).length === 0" class="text-center q-pa-xl text-grey">
          <q-icon name="history" size="60px" />
          <div class="text-h6 q-mt-md">
            {{
              targetTab === 'pending'
                ? '目前沒有審核中的申請'
                : targetTab === 'approved'
                  ? '目前沒有已錄取的活動'
                  : '沒有相關紀錄'
            }}
          </div>
        </div>

        <div v-else class="row q-col-gutter-md">
          <div v-for="app in getFilteredApps(targetTab)" :key="app._id" class="col-12">
            <q-card flat bordered class="shadow-1">
              <q-item>
                <q-item-section avatar>
                  <q-avatar rounded size="80px">
                    <img
                      :src="
                        app.event?.imgUrl || `https://picsum.photos/seed/${app.event?._id}/800/600`
                      "
                      style="object-fit: cover"
                    />
                  </q-avatar>
                </q-item-section>

                <q-item-section>
                  <div class="row items-center q-gutter-x-sm">
                    <q-item-label class="text-bold text-h6">{{ app.event?.title }}</q-item-label>
                    <q-badge v-if="app.attended" color="green" label="已計入時數" icon="done" />
                  </div>

                  <q-item-label caption class="q-mt-xs">
                    報名日期：{{ new Date(app.createdAt).toLocaleDateString() }}
                  </q-item-label>

                  <q-item-label
                    v-if="app.reviewComment"
                    class="text-orange-9 text-caption q-mt-xs bg-orange-1 q-pa-xs rounded-borders"
                  >
                    <q-icon name="feedback" /> 管理員回覆：{{ app.reviewComment }}
                  </q-item-label>
                </q-item-section>

                <q-item-section side>
                  <div class="column items-end q-gutter-y-xs">
                    <q-badge :color="getStatusColor(app.status)" class="q-pa-sm text-subtitle2">
                      {{ getStatusText(app.status) }}
                    </q-badge>
                    <div
                      v-if="app.status === 'approved' && !app.attended"
                      class="text-caption text-grey"
                    >
                      等待活動開展
                    </div>
                  </div>
                </q-item-section>
              </q-item>

              <q-separator />

              <q-card-actions align="right">
                <q-btn
                  flat
                  color="primary"
                  icon="info"
                  label="活動詳情"
                  :to="'/events/' + app.event?._id"
                />

                <q-btn
                  v-if="canCancel(app)"
                  flat
                  color="negative"
                  icon="cancel"
                  label="取消報名"
                  @click="handleCancel(app._id)"
                />
              </q-card-actions>
            </q-card>
          </div>
        </div>
      </q-tab-panel>
    </q-tab-panels>
  </q-page>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getMyApplications, cancelApplication } from 'src/api/application'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth'
import dayjs from 'dayjs'

const $q = useQuasar()
const auth = useAuthStore()
const route = useRoute()
const applications = ref([])
const loading = ref(true)
const tab = ref(route.query.tab || 'pending')

// 監聽路由參數變化，支援從通知點擊跳轉時自動切換頁籤
watch(
  () => route.query.tab,
  (newTab) => {
    if (newTab) {
      tab.value = newTab
    }
  },
)

const getFilteredApps = (tabName) => {
  if (tabName === 'pending') {
    // 進行中：僅顯示審核中
    return applications.value.filter((a) => a.status === 'pending')
  } else if (tabName === 'approved') {
    // 已錄取：顯示所有已錄取 (包含已出席與未出席)
    return applications.value.filter((a) => a.status === 'approved')
  } else if (tabName === 'closed') {
    // 關閉：未錄取 或 已取消
    return applications.value.filter((a) => a.status === 'rejected' || a.status === 'cancelled')
  }
  return []
}

const getStatusText = (status) => {
  const map = {
    pending: '審核中',
    approved: '已錄取',
    rejected: '未錄取',
    cancelled: '已取消',
  }
  return map[status] || '未知狀態'
}

const getStatusColor = (status) => {
  const map = {
    pending: 'orange',
    approved: 'positive',
    rejected: 'negative',
    cancelled: 'grey-7',
  }
  return map[status] || 'grey'
}

const canCancel = (app) => {
  if (!app || !app.event) return false
  const isCancellableStatus = ['pending', 'approved'].includes(app.status)
  const isEventOver = dayjs().isAfter(dayjs(app.event.serviceDateRange?.end))
  return isCancellableStatus && !isEventOver && !app.attended
}

const fetchApps = async () => {
  try {
    const { data } = await getMyApplications()
    applications.value = data.result
  } catch (error) {
    console.error(error)
    $q.notify({ color: 'negative', message: '讀取紀錄失敗' })
  } finally {
    loading.value = false
  }
}

const handleCancel = (id) => {
  $q.dialog({
    title: '取消報名確認',
    message: '確定要取消此活動的報名嗎？此紀錄將移動至「未錄取/取消」清單。',
    cancel: {
      label: '返回',
      flat: true,
      color: 'grey',
    },
    ok: {
      label: '確定取消',
      flat: true,
      color: 'negative',
    },
    persistent: true,
  }).onOk(async () => {
    try {
      await cancelApplication(id)
      $q.notify({ color: 'positive', message: '已成功取消報名', icon: 'check' })
      await fetchApps()
      await auth.fetchProfile()
    } catch (error) {
      console.error(error)
      $q.notify({ color: 'negative', message: '取消失敗' })
    }
  })
}

onMounted(fetchApps)
</script>

<style scoped>
.rounded-borders {
  border-radius: 4px;
}
</style>
