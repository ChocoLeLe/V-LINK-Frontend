<template>
  <q-page class="bg-white">
    <!-- Hero Section: 首圖與主要行動呼籲 -->
    <div class="hero-section relative-position text-white">
      <!-- 輪播圖背景 -->
      <q-carousel
        animated
        v-model="slide"
        arrows
        swipeable
        ref="carousel"
        navigation
        infinite
        :autoplay="autoplay"
        transition-prev="slide-right"
        transition-next="slide-left"
        @mouseenter="autoplay = false"
        @mouseleave="autoplay = true"
        height="100%"
        class="bg-dark"
      >
        <q-carousel-slide
          :name="1"
          img-src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
        />
        <q-carousel-slide
          :name="2"
          img-src="https://images.unsplash.com/photo-1593113598332-cd288d649433?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
        />
        <q-carousel-slide
          :name="3"
          img-src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
        />
      </q-carousel>

      <!-- 文字內容 (置中覆蓋) -->
      <div class="absolute-full flex flex-center" style="pointer-events: none">
        <div class="text-center q-pa-md" style="max-width: 800px">
          <h1
            class="text-h2 text-weight-bold q-mb-md mobile-h3"
            style="pointer-events: auto; text-shadow: 0 2px 8px rgba(0, 0, 0, 0.9)"
          >
            V-Link 智慧志工媒合平台
          </h1>
          <div
            class="text-h5 q-mb-xl opacity-90 mobile-subtitle"
            style="pointer-events: auto; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.9)"
          >
            智慧媒合您的專業技能，讓每一份愛心精準發揮最大價值。
          </div>
          <div class="row justify-center q-gutter-md" style="pointer-events: auto">
            <q-btn
              size="lg"
              color="primary"
              label="探索活動"
              icon="explore"
              to="/events"
              class="q-px-xl text-bold shadow-3"
            />
            <q-btn
              v-if="!auth.isLoggedIn"
              size="lg"
              color="white"
              text-color="dark"
              label="立即加入"
              to="/register"
              class="q-px-xl text-bold shadow-3"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Features Section: 平台特色 -->
    <div class="section-padding bg-grey-2">
      <div class="container q-mx-auto q-px-md" style="max-width: 1200px">
        <div class="text-h4 text-center text-weight-bold q-mb-xl text-primary">
          為什麼選擇 V-Link？
        </div>
        <div class="row q-col-gutter-lg">
          <div class="col-12 col-md-4 text-center">
            <q-card flat class="bg-transparent feature-card full-height">
              <q-card-section>
                <div class="icon-circle bg-blue-1 q-mb-md">
                  <q-icon name="psychology" size="40px" color="primary" />
                </div>
                <div class="text-h6 q-mb-sm text-bold">智慧媒合</div>
                <div class="text-grey-8" style="line-height: 1.6">
                  系統根據您的技能與興趣，自動推薦最適合的志工活動，讓您的專長發揮最大價值，不再大海撈針。
                </div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-12 col-md-4 text-center">
            <q-card flat class="bg-transparent feature-card full-height">
              <q-card-section>
                <div class="icon-circle bg-green-1 q-mb-md">
                  <q-icon name="verified" size="40px" color="green" />
                </div>
                <div class="text-h6 q-mb-sm text-bold">數位服務證明</div>
                <div class="text-grey-8" style="line-height: 1.6">
                  自動記錄每一筆服務時數，隨時可匯出精美的數位服務證書，豐富您的學習歷程檔案與履歷。
                </div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-12 col-md-4 text-center">
            <q-card flat class="bg-transparent feature-card full-height">
              <q-card-section>
                <div class="icon-circle bg-orange-1 q-mb-md">
                  <q-icon name="groups" size="40px" color="orange" />
                </div>
                <div class="text-h6 q-mb-sm text-bold">社群連結</div>
                <div class="text-grey-8" style="line-height: 1.6">
                  加入志工社群，結識志同道合的夥伴，一同參與多元活動，擴展人際網絡，創造更多社會影響力。
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>
    </div>

    <!-- Categories Preview: 服務類別 -->
    <div class="section-padding bg-white">
      <div class="container q-mx-auto q-px-md text-center" style="max-width: 1200px">
        <div class="text-h4 text-weight-bold q-mb-lg text-primary">多元服務領域</div>
        <p class="text-subtitle1 text-grey-7 q-mb-xl">我們提供多樣化的服務類別，等待您的熱情參與</p>

        <div class="row justify-center q-gutter-lg">
          <div class="category-pill bg-teal text-white shadow-2">
            <q-icon name="forest" size="2rem" />
            <span class="text-subtitle1 q-ml-sm text-bold">生態環保</span>
          </div>
          <div class="category-pill bg-indigo text-white shadow-2">
            <q-icon name="school" size="2rem" />
            <span class="text-subtitle1 q-ml-sm text-bold">文化教育</span>
          </div>
          <div class="category-pill bg-purple text-white shadow-2">
            <q-icon name="elderly" size="2rem" />
            <span class="text-subtitle1 q-ml-sm text-bold">老人關懷</span>
          </div>
          <div class="category-pill bg-pink text-white shadow-2">
            <q-icon name="volunteer_activism" size="2rem" />
            <span class="text-subtitle1 q-ml-sm text-bold">弱勢助學</span>
          </div>
          <div class="category-pill bg-cyan text-white shadow-2">
            <q-icon name="diversity_3" size="2rem" />
            <span class="text-subtitle1 q-ml-sm text-bold">社區服務</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Latest Events Section: 最新活動預覽 -->
    <div class="section-padding bg-grey-2">
      <div class="container q-mx-auto q-px-md" style="max-width: 1200px">
        <div class="row justify-between items-center q-mb-lg">
          <div class="text-h4 text-weight-bold text-primary mobile-h5">最新活動機會</div>
          <q-btn flat color="primary" label="查看更多" icon-right="arrow_forward" to="/events" />
        </div>

        <div v-if="loading" class="row justify-center q-py-xl">
          <q-spinner-dots color="primary" size="40px" />
        </div>

        <div v-else class="row q-col-gutter-md">
          <div v-for="event in latestEvents" :key="event._id" class="col-12 col-sm-6 col-md-3">
            <EventCard :event="event" />
          </div>
        </div>
      </div>
    </div>

    <!-- CTA Section: 底部行動呼籲 -->
    <div
      class="bg-primary text-white section-padding text-center relative-position overflow-hidden"
    >
      <div
        class="absolute-left full-height flex flex-center gt-sm"
        style="left: 2%; opacity: 0.2; pointer-events: none; transform: scale(1.2) translateX(-10%)"
      >
        <img src="../assets/img/undraw_business-deal_nx2n.svg" style="width: 550px" />
      </div>

      <div
        class="absolute-right full-height flex flex-center gt-sm"
        style="right: 2%; opacity: 0.2; pointer-events: none; transform: scale(1.2) translateX(-5%)"
      >
        <img src="../assets/img/undraw_spread-love_0ekp.svg" style="width: 550px" />
      </div>

      <div class="container q-mx-auto q-px-md relative-position" style="z-index: 1">
        <div class="text-h4 text-weight-bold q-mb-md mobile-h5">準備好開始您的志工旅程了嗎？</div>
        <div class="text-h6 q-mb-xl opacity-80 mobile-subtitle">
          加入 V-Link，讓改變從現在開始。
        </div>
        <div class="row justify-center q-gutter-md">
          <template v-if="!auth.isLoggedIn">
            <q-btn
              size="lg"
              outline
              color="white"
              label="已有帳號登入"
              to="/login"
              class="text-bold"
            />
            <q-btn
              size="lg"
              color="white"
              text-color="primary"
              label="免費註冊帳號"
              to="/register"
              class="text-bold shadow-2"
            />
          </template>
          <q-btn
            v-else
            size="lg"
            color="secondary"
            text-color="white"
            label="前往個人檔案"
            to="/my/profile"
            class="text-bold shadow-2"
          />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from 'src/stores/auth'
import { getEvents } from 'src/api/event'
import dayjs from 'dayjs'
import EventCard from 'src/components/EventCard.vue'

const auth = useAuthStore()
const events = ref([])
const loading = ref(true)
const slide = ref(1)
const autoplay = ref(true)
const carousel = ref(null)

// 取得最新的 4 筆「可報名」活動
const latestEvents = computed(() => {
  const now = dayjs()
  return [...events.value]
    .filter((event) => {
      const isFull = (event.approvedCount || 0) >= event.maxParticipants
      const isDeadlinePassed = now.isAfter(dayjs(event.registrationDeadline))
      return !isFull && !isDeadlinePassed
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 4)
})

onMounted(async () => {
  try {
    const { data } = await getEvents()
    events.value = data.result || []
  } catch (error) {
    console.error('無法載入活動資料', error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.hero-section {
  height: 600px;
  width: 100%;
}

.icon-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.section-padding {
  padding-top: 120px;
  padding-bottom: 120px;
}

@media (max-width: 599px) {
  .hero-section {
    height: 500px;
  }
  .mobile-h3 {
    font-size: 2.5rem;
    line-height: 1.2;
  }
  .mobile-h5 {
    font-size: 1.5rem;
  }
  .mobile-subtitle {
    font-size: 1rem;
  }

  .section-padding {
    padding-top: 80px;
    padding-bottom: 80px;
  }
}

/* 輪播圖箭頭自訂樣式 */
:deep(.q-carousel__arrow) {
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
  height: 100%;
  width: 80px;
  top: 0;
  transform: none;
  border-radius: 0;
  background-color: transparent !important;
}

:deep(.q-carousel__arrow:hover) {
  opacity: 1;
}

:deep(.q-carousel__arrow .q-icon) {
  font-size: 3.5rem;
  border-radius: 8px;
}

/* 輪播圖下方導航點樣式 */
:deep(.q-carousel__navigation-inner .q-btn .q-icon) {
  font-size: 14px;
}

.category-pill {
  display: flex;
  align-items: center;
  padding: 8px 20px;
  border-radius: 100px;
  user-select: none;
}
</style>
