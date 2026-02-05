<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="updateModel"
    full-width
    @hide="$emit('hide')"
  >
    <q-card>
      <q-card-section class="row items-center">
        <div class="text-h6">審核名單：{{ event?.title }}</div>
        <q-space />
        <div v-if="event" class="q-mr-lg text-subtitle2">
          當前名額：
          <q-badge
            :color="localApprovedCount >= event.maxParticipants ? 'negative' : 'primary'"
            class="q-pa-sm"
          >
            {{ localApprovedCount }} / {{ event.maxParticipants }}
          </q-badge>
          <span
            v-if="localApprovedCount >= event.maxParticipants"
            class="text-negative q-ml-sm text-bold"
            >已額滿</span
          >
        </div>
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section v-if="loading" class="text-center">
        <q-spinner-dots size="40px" color="primary" />
      </q-card-section>

      <q-card-section v-else class="q-pa-none">
        <div v-if="applications.length === 0" class="text-center text-grey q-pa-xl">
          <q-icon name="people_outline" size="40px" />
          <div class="q-mt-sm">目前尚無人報名</div>
        </div>

        <!-- Mobile View -->
        <div v-if="$q.screen.lt.md" class="q-pa-sm q-gutter-y-md">
          <q-card v-for="app in applications" :key="app._id" flat bordered>
            <q-card-section class="q-pb-sm">
              <div class="row items-center q-gutter-md no-wrap">
                <q-avatar size="48px">
                  <img
                    :src="
                      app.user?.avatar ||
                      `https://api.dicebear.com/9.x/thumbs/svg?seed=${app.user?.account}`
                    "
                  />
                </q-avatar>
                <div class="col" style="min-width: 0">
                  <div
                    class="text-weight-bold text-primary cursor-pointer ellipsis"
                    @click="$router.push(`/admin/volunteers/${app.user._id}`)"
                  >
                    {{ app.user?.name || '無名志工' }}
                    <q-tooltip>查看志工詳細資料</q-tooltip>
                  </div>
                  <div class="text-caption text-grey ellipsis">
                    {{ app.user?.account }}
                  </div>
                </div>
                <div class="col-auto">
                  <q-badge :color="getMatchScoreColor(app.matchScore)" text-color="white">
                    契合度 {{ app.matchScore || 0 }}%
                  </q-badge>
                </div>
              </div>
            </q-card-section>

            <q-list dense separator>
              <q-item>
                <q-item-section avatar>
                  <q-icon name="phone" size="xs" color="grey-7" />
                </q-item-section>
                <q-item-section>{{ app.user?.phone || '未填寫電話' }}</q-item-section>
              </q-item>
              <q-item>
                <q-item-section avatar>
                  <q-icon name="psychology" size="xs" color="grey-7" />
                </q-item-section>
                <q-item-section>
                  <div v-if="app.user?.skills?.length > 0" class="row q-gutter-xs">
                    <q-chip
                      v-for="skill in app.user.skills"
                      :key="skill"
                      size="sm"
                      color="blue-1"
                      text-color="blue-8"
                      >{{ skill }}</q-chip
                    >
                  </div>
                  <div v-else class="text-grey">無技能</div>
                </q-item-section>
              </q-item>
              <q-item v-if="app.note">
                <q-item-section>
                  <q-item-label class="text-blue-9 text-caption bg-blue-1 q-pa-xs rounded-borders">
                    <q-icon name="sticky_note_2" /> 備註：{{ app.note }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>

            <q-separator />

            <q-card-section class="row items-center justify-between bg-grey-1 q-py-sm">
              <q-badge :color="getStatusColor(app.status)" class="q-pa-sm">
                {{ getStatusLabel(app.status) }}
              </q-badge>
              <div v-if="app.status === 'approved'" class="row items-center q-gutter-x-sm">
                <div class="text-caption">出席</div>
                <q-toggle
                  v-model="app.attended"
                  color="green"
                  dense
                  @update:model-value="(val) => handleAttendanceChange(app, val)"
                />
              </div>
            </q-card-section>

            <q-card-actions align="right" class="q-gutter-xs">
              <q-btn
                v-if="
                  app.status !== 'approved' &&
                  app.status !== 'cancelled' &&
                  app.status !== 'rejected'
                "
                color="positive"
                label="錄取"
                dense
                unelevated
                class="q-px-sm"
                @click="handleStatusChange(app._id, 'approved')"
              />
              <q-btn
                v-if="app.status !== 'rejected' && app.status !== 'cancelled'"
                color="negative"
                label="拒絕"
                dense
                unelevated
                class="q-px-sm"
                :disable="app.attended"
                @click="handleStatusChange(app._id, 'rejected')"
              >
                <q-tooltip v-if="app.attended">請先取消出席狀態再拒絕</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                dense
                :text-color="app.attended || app.status === 'approved' ? 'grey-4' : 'negative'"
                icon="delete_outline"
                @click="handleDeleteApplication(app)"
              >
                <q-tooltip v-if="app.attended">請先取消出席狀態再刪除</q-tooltip>
                <q-tooltip v-else-if="app.status === 'approved'"
                  >已錄取紀錄不可刪除，請先改為拒絕</q-tooltip
                >
                <q-tooltip v-else>刪除此申請紀錄</q-tooltip>
              </q-btn>
            </q-card-actions>
          </q-card>
        </div>

        <!-- Desktop View -->
        <q-list v-else bordered separator>
          <q-item v-for="app in applications" :key="app._id">
            <q-item-section avatar>
              <q-avatar size="48px">
                <img
                  :src="
                    app.user?.avatar ||
                    `https://api.dicebear.com/9.x/thumbs/svg?seed=${app.user?.account}`
                  "
                />
              </q-avatar>
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-weight-bold">
                <span
                  class="text-primary cursor-pointer"
                  style="text-decoration: underline"
                  @click="$router.push(`/admin/volunteers/${app.user._id}`)"
                >
                  {{ app.user?.name || '無名志工' }}
                  <q-tooltip>查看志工詳細資料</q-tooltip>
                </span>
                <q-badge
                  :color="getMatchScoreColor(app.matchScore)"
                  text-color="white"
                  class="q-ml-sm"
                >
                  契合度 {{ app.matchScore || 0 }}%
                </q-badge>
              </q-item-label>
              <q-item-label caption>
                帳號：{{ app.user?.account }} | 電話：{{ app.user?.phone || '未填寫' }} | 技能：{{
                  app.user?.skills?.length > 0 ? app.user.skills.join(', ') : '無'
                }}
              </q-item-label>
              <q-item-label
                v-if="app.note"
                class="text-blue-9 text-caption q-mt-xs bg-blue-1 q-pa-xs rounded-borders"
                style="display: inline-block"
              >
                <q-icon name="sticky_note_2" /> 備註：{{ app.note }}
              </q-item-label>
            </q-item-section>

            <q-item-section v-if="app.status === 'approved'" side>
              <div class="column items-center">
                <div class="text-caption q-mb-xs">出席狀態</div>
                <q-toggle
                  v-model="app.attended"
                  color="green"
                  @update:model-value="(val) => handleAttendanceChange(app, val)"
                />
              </div>
            </q-item-section>

            <q-item-section side>
              <div class="row q-gutter-sm items-center">
                <q-btn
                  v-if="
                    app.status !== 'approved' &&
                    app.status !== 'cancelled' &&
                    app.status !== 'rejected'
                  "
                  color="positive"
                  label="錄取"
                  dense
                  unelevated
                  class="q-px-sm"
                  @click="handleStatusChange(app._id, 'approved')"
                />
                <q-btn
                  v-if="app.status !== 'rejected' && app.status !== 'cancelled'"
                  color="negative"
                  label="拒絕"
                  dense
                  unelevated
                  class="q-px-sm"
                  :disable="app.attended"
                  @click="handleStatusChange(app._id, 'rejected')"
                >
                  <q-tooltip v-if="app.attended">請先取消出席狀態再拒絕</q-tooltip>
                </q-btn>

                <q-badge :color="getStatusColor(app.status)" class="q-pa-sm">
                  {{ getStatusLabel(app.status) }}
                </q-badge>

                <q-btn
                  flat
                  round
                  dense
                  color="grey-5"
                  :text-color="app.attended || app.status === 'approved' ? 'grey-4' : 'negative'"
                  icon="delete_outline"
                  @click="handleDeleteApplication(app)"
                >
                  <q-tooltip v-if="app.attended">請先取消出席狀態再刪除</q-tooltip>
                  <q-tooltip v-else-if="app.status === 'approved'"
                    >已錄取紀錄不可刪除，請先改為拒絕</q-tooltip
                  >
                  <q-tooltip v-else>刪除此申請紀錄</q-tooltip>
                </q-btn>
              </div>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth'
import {
  getEventApplications,
  updateApplicationStatus,
  cancelApplication,
} from 'src/api/application'
import { getMatchScoreColor } from 'src/utils/tag-colors.js'

const props = defineProps({
  modelValue: Boolean,
  event: Object,
})

const emit = defineEmits(['update:modelValue', 'refresh', 'hide'])
const $q = useQuasar()
const auth = useAuthStore()

const applications = ref([])
const loading = ref(false)
const localApprovedCount = ref(0)

const updateModel = (val) => emit('update:modelValue', val)

const getStatusLabel = (status) => {
  const map = { approved: '已錄取', rejected: '已拒絕', cancelled: '已取消', pending: '待審核' }
  return map[status] || '未知'
}

const getStatusColor = (status) => {
  const map = { approved: 'positive', rejected: 'negative', cancelled: 'grey', pending: 'orange' }
  return map[status] || 'grey'
}

const fetchApplications = async () => {
  if (!props.event) return
  loading.value = true
  try {
    const { data } = await getEventApplications(props.event._id)
    applications.value = data.result

    // 更新本地顯示的 approvedCount
    localApprovedCount.value = applications.value.filter((a) => a.status === 'approved').length
  } catch (error) {
    console.error(error)
    $q.notify({ color: 'negative', message: '讀取報名名單失敗' })
  } finally {
    loading.value = false
  }
}

const handleStatusChange = (appId, newStatus) => {
  if (newStatus === 'rejected') {
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
    }).onOk((reason) => {
      executeStatusChange(appId, newStatus, reason)
    })
  } else {
    executeStatusChange(appId, newStatus)
  }
}

const executeStatusChange = async (appId, newStatus, reviewComment = '') => {
  try {
    await updateApplicationStatus(appId, { status: newStatus, reviewComment })
    const msg = newStatus === 'approved' ? '已成功錄取志工' : '已將申請設為拒絕'
    const icon = newStatus === 'approved' ? 'check_circle' : 'close'
    $q.notify({ color: 'positive', message: msg, icon: icon })

    await fetchApplications()
    emit('refresh') // 通知父層重新整理活動列表
  } catch (error) {
    console.error(error)
    const msg = error.response?.data?.message || '審核失敗'
    $q.notify({ color: 'negative', message: msg })
  }
}

const handleAttendanceChange = async (app, isAttended) => {
  try {
    await updateApplicationStatus(app._id, { attended: isAttended })
    // 若是管理員自己操作自己的紀錄(極少見)，更新 auth profile
    if (app.user?._id === auth.user._id) await auth.fetchProfile()

    $q.notify({
      color: 'positive',
      message: isAttended ? '已標記出席，時數已累計' : '已取消出席，時數已扣除',
      icon: 'update',
    })
  } catch (error) {
    console.error(error)
    app.attended = !isAttended // Revert toggle
    const msg = error.response?.data?.message || '更新出席狀態失敗'
    $q.notify({ color: 'negative', message: msg })
  }
}

const handleDeleteApplication = (app) => {
  if (app.attended) {
    $q.notify({
      color: 'warning',
      icon: 'priority_high',
      message: '無法刪除！請先將出席狀態切換為「未出席」。',
    })
    return
  }
  if (app.status === 'approved') {
    $q.notify({
      color: 'negative',
      icon: 'block',
      message: '已錄取的志工紀錄不可刪除！請先將狀態改為拒絕。',
    })
    return
  }

  $q.dialog({
    title: '刪除申請紀錄',
    message: `確定要刪除志工 ${app.user?.name || '此人'} 的報名紀錄嗎？`,
    cancel: { label: '取消', color: 'grey', flat: true },
    ok: { label: '確定刪除', color: 'negative', flat: true },
    persistent: true,
  }).onOk(async () => {
    try {
      await cancelApplication(app._id)
      $q.notify({ color: 'positive', message: '紀錄已成功刪除', icon: 'check' })
      await fetchApplications()
      emit('refresh')
    } catch (error) {
      console.error(error)
      const msg = error.response?.data?.message || '刪除失敗'
      $q.notify({ color: 'negative', message: msg, icon: 'error' })
    }
  })
}

watch(
  () => props.modelValue,
  (val) => {
    if (val) fetchApplications()
  },
)

watch(
  () => props.event,
  (val) => {
    if (val) {
      localApprovedCount.value = val.approvedCount || 0
    }
  },
  { immediate: true },
)
</script>
