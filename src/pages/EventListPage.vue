<template>
  <q-page class="q-pa-md" style="padding-bottom: 80px">
    <!-- Toolbar: 搜尋、排序、檢視切換 -->
    <div class="row q-col-gutter-sm q-mb-md items-center">
      <!-- 搜尋 -->
      <div class="col-12 col-md-4">
        <q-input
          v-model="searchText"
          dense
          outlined
          placeholder="搜尋活動名稱或地點..."
          clearable
          bg-color="white"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>

      <!-- 排序 -->
      <div class="col-6 col-md-3">
        <q-select
          v-model="sortBy"
          :options="sortOptions"
          dense
          outlined
          emit-value
          map-options
          label="排序方式"
          bg-color="white"
        >
          <template v-slot:prepend>
            <q-icon name="sort" />
          </template>
        </q-select>
      </div>

      <q-space />

      <!-- 檢視切換 -->
      <div class="col-auto gt-sm">
        <q-btn-toggle
          v-model="viewMode"
          unelevated
          toggle-color="primary"
          :options="[
            { value: 'grid', slot: 'grid' },
            { value: 'list', slot: 'list' },
          ]"
        >
          <template v-slot:grid>
            <q-icon name="grid_view" />
            <q-tooltip>卡片檢視</q-tooltip>
          </template>
          <template v-slot:list>
            <q-icon name="view_list" />
            <q-tooltip>清單檢視</q-tooltip>
          </template>
        </q-btn-toggle>
      </div>
    </div>

    <!-- Loading 狀態 -->
    <div v-if="loading" class="flex flex-center q-pa-xl">
      <q-spinner-dots color="primary" size="40px" />
    </div>

    <!-- 無資料狀態 -->
    <div v-else-if="filteredEvents.length === 0" class="text-center text-grey q-pa-xl">
      <q-icon name="event_busy" size="60px" />
      <div class="text-h6 q-mt-md">沒有符合條件的活動</div>
    </div>

    <!-- 卡片檢視 (Grid View) -->
    <div v-else-if="viewMode === 'grid'" class="row q-col-gutter-lg">
      <div
        v-for="event in filteredEvents"
        :key="event._id"
        class="col-12 col-sm-6 col-md-4 col-lg-3"
      >
        <EventCard :event="event" />
      </div>
    </div>

    <!-- 清單檢視 (List View) -->
    <div v-else>
      <div class="row q-col-gutter-md">
        <div v-for="event in filteredEvents" :key="event._id" class="col-12">
          <q-card
            flat
            bordered
            class="cursor-pointer hover-card"
            @click="$router.push(`/events/${event._id}`)"
          >
            <q-item class="q-py-md">
              <q-item-section avatar>
                <q-img
                  :src="event.imgUrl || `https://picsum.photos/seed/${event._id}/400/300`"
                  style="width: 120px; height: 90px; border-radius: 8px"
                  fit="cover"
                />
              </q-item-section>

              <q-item-section>
                <div class="row items-center full-width">
                  <div class="col-grow col-sm-3 q-pr-md">
                    <div class="text-h6 text-weight-bold q-mb-xs">{{ event.title }}</div>
                    <div class="row items-center q-gutter-sm text-caption text-grey-8">
                      <div class="row items-center">
                        <q-icon name="event" size="xs" class="q-mr-xs" />
                        {{ formatDate(event.serviceDateRange?.start) }}
                      </div>
                      <q-separator vertical spaced />
                      <div class="row items-center">
                        <q-icon name="place" size="xs" class="q-mr-xs" />
                        {{ event.location }}
                      </div>
                    </div>
                  </div>

                  <div class="col-sm-3 gt-xs row items-center justify-center q-gutter-x-sm">
                    <q-badge :color="getCategoryColor(event.category?.name)">
                      {{ event.category?.name || '未分類' }}
                    </q-badge>
                    <q-badge :color="getVolunteerTypeColor(event.volunteerType?.name)">
                      {{ event.volunteerType?.name || '一般志工' }}
                    </q-badge>
                  </div>

                  <div class="col-sm-3 gt-xs row items-center justify-center q-gutter-xs">
                    <q-chip
                      v-for="skill in event.requiredSkills"
                      :key="skill._id"
                      size="sm"
                      color="blue-1"
                      text-color="blue-8"
                      class="q-ma-none"
                    >
                      {{ skill.name }}
                    </q-chip>
                    <span v-if="!event.requiredSkills?.length" class="text-grey-6 text-caption"
                      >不限技能</span
                    >
                  </div>

                  <div class="col-auto col-sm-3 column items-end justify-center q-gutter-y-sm">
                    <div v-if="auth.isLoggedIn">
                      <q-badge :color="getMatchScoreColor(getMatchScore(event))" class="q-pa-xs">
                        契合度 {{ getMatchScore(event) }}%
                      </q-badge>
                    </div>
                    <div v-else class="text-grey-5 text-caption">請登入查看契合度</div>

                    <div class="text-caption">
                      <span
                        :class="
                          event.approvedCount >= event.maxParticipants
                            ? 'text-negative text-bold'
                            : 'text-primary'
                        "
                      >
                        {{ event.approvedCount >= event.maxParticipants ? '已額滿' : '報名中' }}
                      </span>
                      <span class="text-grey-7 q-ml-xs">
                        ({{ event.approvedCount }} / {{ event.maxParticipants }})
                      </span>
                    </div>
                  </div>
                </div>
              </q-item-section>
            </q-item>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { getEvents } from 'src/api/event'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth'
import { formatDate } from 'src/utils/formatter.js'
import {
  getCategoryColor,
  getMatchScoreColor,
  getVolunteerTypeColor,
} from 'src/utils/tag-colors.js'
import EventCard from 'src/components/EventCard.vue'

const $q = useQuasar()
const auth = useAuthStore()
const events = ref([])
const loading = ref(true)
const searchText = ref('')
const sortBy = ref('date_asc')
const viewMode = ref('grid') // 預設為卡片檢視

const sortOptions = [
  { label: '時間 (近 -> 遠)', value: 'date_asc' },
  { label: '時間 (遠 -> 近)', value: 'date_desc' },
  { label: '媒合分數 (高 -> 低)', value: 'match_score_desc' },
  { label: '報名狀態 (可報名優先)', value: 'status_asc' },
  { label: '活動類型', value: 'category_asc' },
  { label: '志工類型', value: 'volunteer_type_asc' },
  { label: '依技能', value: 'skills_asc' },
]

const getMatchScore = (event) => {
  if (!auth.isLoggedIn) return 0
  if (!event.requiredSkills?.length) return 100
  const userSkills = (auth.user.skills || []).map((s) =>
    typeof s === 'object' ? s.name : String(s),
  )
  const reqSkills = event.requiredSkills.map((s) => (typeof s === 'object' ? s.name : String(s)))
  const matches = reqSkills.filter((s) => userSkills.includes(s))
  return Math.round((matches.length / reqSkills.length) * 100)
}

const fetchEvents = async () => {
  try {
    const { data } = await getEvents()
    events.value = data.result
  } catch (error) {
    console.log(error)
    $q.notify({ type: 'negative', message: '無法載入活動列表' })
  } finally {
    loading.value = false
  }
}

const filteredEvents = computed(() => {
  let result = [...events.value]

  // 搜尋過濾
  if (searchText.value) {
    const lower = searchText.value.toLowerCase()
    result = result.filter(
      (e) => e.title?.toLowerCase().includes(lower) || e.location?.toLowerCase().includes(lower),
    )
  }

  // 統一排序邏輯
  result.sort((a, b) => {
    switch (sortBy.value) {
      case 'date_asc':
        return new Date(a.serviceDateRange?.start) - new Date(b.serviceDateRange?.start)
      case 'date_desc':
        return new Date(b.serviceDateRange?.start) - new Date(a.serviceDateRange?.start)
      case 'match_score_desc':
        return getMatchScore(b) - getMatchScore(a)
      case 'status_asc': {
        const isFullA = a.approvedCount >= a.maxParticipants
        const isFullB = b.approvedCount >= b.maxParticipants
        if (isFullA === isFullB) {
          return new Date(a.serviceDateRange?.start) - new Date(b.serviceDateRange?.start)
        }
        return isFullA - isFullB // false (0) comes before true (1)
      }
      case 'category_asc':
        return (a.category?.name || 'zzz').localeCompare(b.category?.name || 'zzz', 'zh-Hant')
      case 'volunteer_type_asc':
        return (a.volunteerType?.name || 'zzz').localeCompare(
          b.volunteerType?.name || 'zzz',
          'zh-Hant',
        )
      case 'skills_asc': {
        const skillA = a.requiredSkills?.[0]?.name || 'zzz'
        const skillB = b.requiredSkills?.[0]?.name || 'zzz'
        return skillA.localeCompare(skillB, 'zh-Hant')
      }
      default:
        return 0
    }
  })

  return result
})

watch(
  () => !$q.screen.gt.sm,
  (isMobile) => {
    if (isMobile) {
      viewMode.value = 'grid'
    }
  },
  { immediate: true },
)

onMounted(fetchEvents)
</script>

<style scoped>
.hover-card {
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}
.hover-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}
</style>
