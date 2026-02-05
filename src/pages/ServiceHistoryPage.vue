<template>
  <q-page class="column">
    <div class="q-pa-md col-grow">
      <div class="text-h5 text-bold q-mb-md">服務歷程</div>

      <!-- 頂部工具列 -->
      <div class="row q-col-gutter-sm q-mb-md items-center">
        <div class="col-12 col-sm-6 col-md-4">
          <q-input
            v-model="searchText"
            dense
            outlined
            placeholder="搜尋活動名稱..."
            clearable
            prepend-icon="search"
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <q-select
            v-model="sortBy"
            :options="sortOptions"
            dense
            outlined
            emit-value
            map-options
            label="排序方式"
          />
        </div>
      </div>

      <q-separator class="q-mb-md" />

      <div v-if="loading" class="text-center q-pa-xl">
        <q-spinner-dots color="primary" size="40px" />
      </div>

      <div v-else-if="sortedApps.length === 0" class="text-center q-pa-xl text-grey">
        <q-icon name="history_edu" size="60px" />
        <div class="text-h6 q-mt-md">尚無符合條件的服務紀錄</div>
      </div>

      <div v-else class="q-mb-xl">
        <div class="row q-col-gutter-md">
          <div v-for="app in sortedApps" :key="app._id" class="col-12">
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
                  <q-item-label class="text-bold text-h6">
                    {{ app.event?.title }}
                  </q-item-label>
                  <q-item-label caption>
                    <q-icon name="event" size="xs" />
                    {{ formatDate(app.event?.serviceDateRange?.start, 'YYYY-MM-DD') }}
                    <span class="q-mx-xs">|</span>
                    <q-icon name="place" size="xs" />
                    {{ app.event?.location }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <div class="text-primary text-bold text-h6" style="white-space: nowrap">
                    + {{ app.event?.hours }} 小時
                  </div>
                </q-item-section>
              </q-item>
            </q-card>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部總計 -->
    <q-separator class="q-mt-lg" />
    <div class="bg-white text-dark q-px-md q-py-sm">
      <div
        class="row justify-between items-center container"
        style="max-width: 1200px; margin: 0 auto"
      >
        <div class="text-subtitle1">目前時數總計</div>
        <div class="text-h6 text-bold text-primary">{{ totalHours }} 小時</div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getMyApplications } from 'src/api/application'
import { useQuasar } from 'quasar'
import { formatDate } from 'src/utils/formatter.js'

const $q = useQuasar()
const rawApps = ref([])
const loading = ref(true)
const searchText = ref('')
const sortBy = ref('dateDesc')

const sortOptions = [
  { label: '日期 (新 -> 舊)', value: 'dateDesc' },
  { label: '日期 (舊 -> 新)', value: 'dateAsc' },
  { label: '時數 (多 -> 少)', value: 'hoursDesc' },
  { label: '時數 (少 -> 多)', value: 'hoursAsc' },
]

const processedApps = computed(() => {
  return rawApps.value.filter((app) => app.status === 'approved' && app.attended)
})

const filteredApps = computed(() => {
  if (!searchText.value) return processedApps.value
  const lowerTerm = searchText.value.toLowerCase()
  return processedApps.value.filter((app) => app.event?.title?.toLowerCase().includes(lowerTerm))
})

const sortedApps = computed(() => {
  const list = [...filteredApps.value]
  return list.sort((a, b) => {
    if (sortBy.value === 'dateDesc')
      return new Date(b.event.serviceDateRange.start) - new Date(a.event.serviceDateRange.start)
    if (sortBy.value === 'dateAsc')
      return new Date(a.event.serviceDateRange.start) - new Date(b.event.serviceDateRange.start)
    if (sortBy.value === 'hoursDesc') return b.event.hours - a.event.hours
    if (sortBy.value === 'hoursAsc') return a.event.hours - b.event.hours
    return 0
  })
})

const totalHours = computed(() => {
  return sortedApps.value.reduce((sum, app) => sum + (app.event?.hours || 0), 0).toFixed(1)
})

onMounted(async () => {
  try {
    const { data } = await getMyApplications()
    rawApps.value = data.result || []
  } catch (error) {
    console.error(error)
    $q.notify({ color: 'negative', message: '讀取服務歷程失敗' })
  } finally {
    loading.value = false
  }
})
</script>
