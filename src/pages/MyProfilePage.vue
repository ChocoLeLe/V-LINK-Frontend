<template>
  <q-page class="q-pa-md">
    <div v-if="loading" class="text-center q-pa-xl">
      <q-spinner-dots color="primary" size="40px" />
    </div>
    <div v-else-if="!userProfile" class="text-center q-pa-xl text-grey">
      <q-icon name="person_off" size="60px" />
      <div class="text-h6 q-mt-md">找不到該志工資料</div>
    </div>
    <div v-else>
      <!-- Header Section -->
      <q-card flat bordered class="q-mb-md">
        <q-card-section :horizontal="$q.screen.gt.xs">
          <q-card-section class="col-auto flex flex-center q-pa-md">
            <q-avatar size="100px">
              <img
                :src="
                  userProfile.avatar ||
                  `https://api.dicebear.com/9.x/thumbs/svg?seed=${userProfile.account}`
                "
                style="object-fit: cover; width: 100%; height: 100%"
              />
            </q-avatar>
          </q-card-section>
          <q-card-section class="q-py-sm col-grow">
            <div class="row items-start justify-between">
              <div>
                <div class="text-h5 text-bold">{{ userProfile.name }}</div>
                <div class="text-subtitle1 text-grey-7">{{ userProfile.account }}</div>
                <div class="text-caption text-grey q-mt-sm">
                  <q-icon name="email" class="q-mr-xs" /> {{ userProfile.email }}
                </div>
                <div class="text-caption text-grey">
                  <q-icon name="phone" class="q-mr-xs" /> {{ userProfile.phone || '未填寫電話' }}
                </div>
                <div class="text-caption text-grey">
                  <q-icon name="face" class="q-mr-xs" /> {{ userProfile.gender || '未填寫性別' }} |
                  {{ userProfile.ageGroup || '未填寫年齡層' }}
                </div>
                <div class="text-caption text-grey">
                  <q-icon name="military_tech" class="q-mr-xs" /> 總服務時數：{{
                    userProfile.totalHours || 0
                  }}
                  小時
                </div>
              </div>

              <!-- 只有本人才顯示的操作按鈕 -->
              <div v-if="isMe" class="column q-gutter-sm">
                <q-btn
                  color="primary"
                  icon="edit"
                  :label="$q.screen.gt.xs ? '編輯資料' : ''"
                  outline
                  size="sm"
                  to="/my/profile/edit"
                >
                  <q-tooltip v-if="$q.screen.lt.sm">編輯資料</q-tooltip>
                </q-btn>
                <q-btn
                  color="secondary"
                  icon="card_membership"
                  :label="$q.screen.gt.xs ? '服務證明' : ''"
                  outline
                  size="sm"
                  @click="showCertDialog = true"
                >
                  <q-tooltip v-if="$q.screen.lt.sm">服務證明</q-tooltip>
                </q-btn>
              </div>
            </div>
          </q-card-section>
        </q-card-section>
      </q-card>

      <div class="row q-col-gutter-md">
        <div class="col-12 col-md-4">
          <!-- Skills & Bio Section -->
          <q-card flat bordered>
            <q-card-section>
              <div class="text-h6">個人資訊</div>
            </q-card-section>
            <q-separator />
            <q-card-section>
              <div class="text-subtitle2 q-mb-sm">擁有技能</div>
              <div v-if="userProfile.skills && userProfile.skills.length > 0" class="q-gutter-sm">
                <q-chip
                  v-for="skill in userProfile.skills"
                  :key="typeof skill === 'object' ? skill._id : skill"
                  color="blue-1"
                  text-color="blue-8"
                  icon="check"
                >
                  {{ typeof skill === 'object' ? skill.name : skill }}
                </q-chip>
              </div>
              <div v-else class="text-grey">尚無技能標籤</div>
            </q-card-section>
            <q-separator />
            <q-card-section>
              <div class="text-subtitle2 q-mb-sm">自我介紹</div>
              <div v-if="userProfile.bio" class="text-body2" style="white-space: pre-wrap">
                {{ userProfile.bio }}
              </div>
              <div v-else class="text-grey">這位志工很低調，沒有留下自我介紹。</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-md-8">
          <!-- History Section -->
          <q-card flat bordered>
            <q-card-section>
              <div class="text-h6">服務歷程 ({{ serviceHistory.length }} 筆)</div>
            </q-card-section>
            <q-separator />
            <q-list separator>
              <q-item v-if="serviceHistory.length === 0">
                <q-item-section class="text-center text-grey q-pa-md"
                  >尚無已出席的服務紀錄</q-item-section
                >
              </q-item>
              <q-item v-for="item in serviceHistory" :key="item._id">
                <q-item-section>
                  <q-item-label class="text-bold">{{ item.event?.title }}</q-item-label>
                  <q-item-label caption>
                    <q-icon name="event" size="xs" />
                    {{ dayjs(item.event?.serviceDateRange?.start).format('YYYY-MM-DD') }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <div class="text-primary text-bold">+ {{ item.event?.hours }} 小時</div>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card>
        </div>
      </div>
    </div>

    <q-dialog v-model="showCertDialog">
      <q-card style="min-width: 850px; max-width: 90vw">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">服務證明預覽</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pa-xl">
          <div
            id="certificate-content"
            class="certificate-border q-pa-xl bg-white text-center relative-position"
          >
            <div class="cert-watermark">V-Link</div>
            <div class="text-h3 text-bold q-mb-xl" style="letter-spacing: 10px">服務證明書</div>

            <div class="text-h6 q-mb-md">茲證明 志工</div>
            <div class="text-h4 text-primary text-bold q-mb-md underline-name">
              {{ userProfile?.name }}
            </div>

            <p class="text-body1 q-mt-xl text-left" style="line-height: 2; padding: 0 50px">
              於 「V-Link 智慧志工媒合系統」 積極參與社會服務活動，<br />
              經統計核實，截至 {{ today }} 止，<br />
              共計服務時數為
              <span class="text-h5 text-bold">{{ userProfile?.totalHours || 0 }}</span> 小時。<br />
              特發此證，以資鼓勵。
            </p>

            <div class="row justify-between q-mt-xl q-pt-xl" style="padding: 0 50px">
              <div class="text-left">
                <div class="text-subtitle2 text-grey-7">
                  證書編號：VL-{{ auth.user._id?.slice(-6).toUpperCase() }}
                </div>
                <div class="text-subtitle2 text-grey-7">核發日期：{{ today }}</div>
              </div>
              <div class="text-center">
                <div class="text-h6 text-bold">V-Link 智慧志工媒合系統</div>
                <div class="text-caption text-grey">營運團隊 敬核</div>
                <div class="q-mt-sm"><q-icon name="verified" color="primary" size="lg" /></div>
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="bg-grey-1">
          <q-btn flat label="取消" v-close-popup />
          <q-btn color="primary" icon="download" label="確認下載 PDF" @click="downloadPDF" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useAuthStore } from 'src/stores/auth'
import { useRoute } from 'vue-router'
import { getAdminUserProfile } from 'src/api/user'
import { getMyApplications } from 'src/api/application'
import { useQuasar } from 'quasar'
import dayjs from 'dayjs'
import html2pdf from 'html2pdf.js'

const auth = useAuthStore()
const route = useRoute()
const $q = useQuasar()

const loading = ref(true)
const userProfile = ref(null)
const serviceHistory = ref([])
const showCertDialog = ref(false)
const today = dayjs().format('YYYY 年 MM 月 DD 日')

// 判斷是否為本人 (若無 ID 參數，或 ID 參數等於當前登入者 ID)
const isMe = computed(() => {
  return !route.params.id || route.params.id === auth.user._id
})

const fetchData = async () => {
  loading.value = true
  try {
    if (isMe.value) {
      // --- 本人模式 ---
      // 確保 store 資料最新
      await auth.fetchProfile()
      userProfile.value = auth.user

      // 取得服務歷程 (從申請紀錄中篩選)
      const { data } = await getMyApplications()
      // 篩選條件：已錄取 (approved) 且 已出席 (attended)
      serviceHistory.value = data.result.filter((app) => app.status === 'approved' && app.attended)
    } else {
      // --- 管理員查看他人模式 ---
      const { data } = await getAdminUserProfile(route.params.id)
      if (data.success) {
        userProfile.value = data.result.profile
        serviceHistory.value = data.result.history
      } else {
        $q.notify({ color: 'negative', message: data.message || '讀取資料失敗' })
      }
    }
  } catch (error) {
    console.error(error)
    const message = error.response?.data?.message || '讀取個人資料時發生錯誤'
    $q.notify({ color: 'negative', message })
  } finally {
    loading.value = false
  }
}

// 監聽路由參數變化 (例如管理員在不同志工間切換)
watch(() => route.params.id, fetchData)

const downloadPDF = () => {
  const element = document.getElementById('certificate-content')
  const opt = {
    margin: [10, 10],
    filename: `V-Link_服務證明_${userProfile.value.name}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
  }
  $q.notify({
    message: '正在產生 PDF 檔案...',
    color: 'info',
    icon: 'hourglass_empty',
    timeout: 800,
  })
  html2pdf()
    .set(opt)
    .from(element)
    .save()
    .then(() => {
      showCertDialog.value = false
    })
}

onMounted(fetchData)
</script>

<style scoped>
/* 精美版證書樣式 */
.certificate-border {
  border: 10px double #1976d2;
  border-radius: 5px;
  min-height: 500px;
  color: #333;
}
.underline-name {
  border-bottom: 2px solid #1976d2;
  display: inline-block;
  padding: 0 40px;
}
.cert-watermark {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-30deg);
  font-size: 150px;
  color: rgba(0, 0, 0, 0.03);
  font-weight: bold;
  pointer-events: none;
  z-index: 0;
}
.relative-position {
  z-index: 1;
}
.border-primary {
  border: 2px solid #1976d2;
}
</style>
