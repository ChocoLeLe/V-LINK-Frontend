<template>
  <q-form @submit.prevent="onSubmit" class="q-gutter-y-md">
    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-12">
        <q-input
          v-model="form.title"
          label="活動標題 *"
          filled
          lazy-rules
          :rules="[(val) => (val && val.length > 0) || '請輸入標題']"
        />
      </div>

      <!-- 圖片上傳區塊 -->
      <div class="col-12 col-md-12">
        <div class="row q-col-gutter-md items-start">
          <div class="col-12 col-md-6">
            <q-file
              v-model="imageFile"
              label="活動封面圖片 (點擊或拖曳上傳)"
              filled
              accept=".jpg, .jpeg, .png"
              max-file-size="2097152"
              clearable
              @rejected="onRejected"
              @update:model-value="handleUpload"
              :loading="uploading"
              :disable="uploading"
            >
              <template v-slot:prepend>
                <q-icon name="cloud_upload" />
              </template>
            </q-file>
            <div class="text-caption text-grey q-mt-xs">支援 JPG, PNG 格式 (上限 2MB)</div>
          </div>
          <!-- 修改：加上 relative-position 讓按鈕可以絕對定位於此 div 內 -->
          <div class="col-12 col-md-6 relative-position" v-if="form.imgUrl || uploading">
            <q-img
              :src="form.imgUrl || ''"
              style="
                max-height: 200px;
                min-height: 150px;
                border-radius: 8px;
                background-color: #f5f5f5;
              "
              fit="cover"
              class="shadow-2"
            >
              <div v-if="form.imgUrl" class="absolute-bottom text-subtitle2 text-center q-pa-xs">
                目前封面預覽
              </div>
              <q-inner-loading :showing="uploading">
                <q-spinner-gears size="50px" color="primary" />
                <div class="text-primary q-mt-sm">上傳中...</div>
              </q-inner-loading>
            </q-img>
            <q-btn
              v-if="form.imgUrl && !uploading"
              round
              color="negative"
              icon="delete"
              size="sm"
              class="absolute"
              style="top: 10px; right: 10px; z-index: 999"
              @click.stop="handleRemoveImage"
            >
              <q-tooltip>移除圖片</q-tooltip>
            </q-btn>
          </div>
        </div>
      </div>

      <div class="col-12 col-md-6">
        <q-input
          v-model="form.location"
          label="活動地點 *"
          filled
          lazy-rules
          :rules="[(val) => (val && val.length > 0) || '請輸入地點']"
        />
      </div>
      <div class="col-12 col-md-3">
        <q-input
          v-model.number="form.maxParticipants"
          type="number"
          label="名額限制 *"
          filled
          :rules="[(val) => val >= 0 || '名額不可為負數']"
        />
      </div>
      <div class="col-12 col-md-3">
        <q-input
          v-model.number="form.hours"
          type="number"
          label="活動時數 *"
          filled
          :disable="form.hasAttendance"
          :hint="form.hasAttendance ? '已有出席紀錄，為確保資料一致性，不可修改時數。' : ''"
          :rules="[(val) => val > 0 || '時數必須大於 0']"
        />
      </div>
      <div class="col-12 col-md-6">
        <q-input
          filled
          v-model="form.serviceDateRange.start"
          label="服務開始時間 *"
          mask="####-##-## ##:##"
          :rules="[
            (val) => !!val || '請選擇開始時間',
            (val) => new Date(val) >= new Date() || '活動開始時間不能為過去時間',
          ]"
        >
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-date
                  v-model="form.serviceDateRange.start"
                  mask="YYYY-MM-DD HH:mm"
                  :options="startDateOptions"
                >
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="確定" color="primary" flat />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
            <q-icon name="access_time" class="cursor-pointer q-ml-sm">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-time v-model="form.serviceDateRange.start" mask="YYYY-MM-DD HH:mm" format24h>
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="確定" color="primary" flat />
                  </div>
                </q-time>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
      </div>

      <div class="col-12 col-md-6">
        <q-input
          filled
          v-model="form.serviceDateRange.end"
          label="服務結束時間 *"
          mask="####-##-## ##:##"
        >
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-date v-model="form.serviceDateRange.end" mask="YYYY-MM-DD HH:mm">
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="確定" color="primary" flat />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
            <q-icon name="access_time" class="cursor-pointer q-ml-sm">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-time v-model="form.serviceDateRange.end" mask="YYYY-MM-DD HH:mm" format24h>
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="確定" color="primary" flat />
                  </div>
                </q-time>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
      </div>

      <div class="col-12 col-md-6">
        <q-input
          filled
          v-model="form.registrationDeadline"
          label="報名截止日 *"
          readonly
          class="cursor-pointer"
          :rules="[
            (val) => !!val || '請選擇截止日期',
            (val) =>
              !form.serviceDateRange.start ||
              new Date(val) <= new Date(form.serviceDateRange.start) ||
              '截止日期必須在活動開始前',
          ]"
        >
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-date
                  v-model="form.registrationDeadline"
                  mask="YYYY-MM-DD"
                  :options="deadlineOptions"
                >
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="確定" color="primary" flat />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
      </div>

      <div class="col-12 col-md-6">
        <q-input filled v-model="form.serviceTarget" label="服務對象" />
      </div>

      <div class="col-12 col-md-4">
        <q-select
          filled
          v-model="form.category"
          :options="tagOptions.categories"
          label="活動類別 *"
          emit-value
          map-options
          :rules="[(val) => !!val || '請選擇活動類別']"
        />
      </div>
      <div class="col-12 col-md-4">
        <q-select
          filled
          v-model="form.volunteerType"
          :options="tagOptions.volunteerTypes"
          label="志工類型 *"
          emit-value
          map-options
          :rules="[(val) => !!val || '請選擇志工類型']"
        />
      </div>
      <!-- 新增：服務時段 (Service Slots) -->
      <div class="col-12 col-md-4">
        <q-select
          filled
          v-model="form.serviceSlots"
          :options="tagOptions.serviceSlots"
          label="服務時段 (可多選)"
          multiple
          emit-value
          map-options
          use-chips
        />
      </div>
      <div class="col-12 col-md-4">
        <q-select
          filled
          v-model="form.requiredSkills"
          :options="tagOptions.skills"
          label="所需技能 (可多選)"
          multiple
          emit-value
          map-options
          use-chips
        />
      </div>
    </div>

    <div>
      <div class="text-subtitle1 q-mb-sm">活動詳細介紹 (支援 Markdown)</div>
      <q-editor v-model="form.description" min-height="15rem" />
    </div>

    <div class="row justify-end q-gutter-sm q-mt-lg">
      <q-btn label="取消" type="reset" color="grey" flat :to="'/admin/events'" />
      <q-btn
        :label="isEditMode ? '儲存變更' : '發佈活動'"
        type="submit"
        color="primary"
        :loading="loading || uploading"
        :disable="uploading"
      />
    </div>
  </q-form>
</template>

<script setup>
import { reactive, onMounted, watch, ref } from 'vue'
import { getCategories, getSkills, getVolunteerTypes, getServiceSlots } from 'src/api/system'
import { uploadImage } from 'src/api/upload'
import { useQuasar, date } from 'quasar'

const $q = useQuasar()

const props = defineProps({
  initialData: {
    type: Object,
    default: () => ({}),
  },
  isEditMode: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['submit'])

const form = reactive({
  title: '',
  imgUrl: '',
  location: '',
  serviceTarget: '',
  serviceDateRange: { start: '', end: '' },
  registrationDeadline: '',
  maxParticipants: 10,
  hours: 8,
  description: '',
  category: null,
  volunteerType: null,
  serviceSlots: [],
  requiredSkills: [],
  hasAttendance: false,
})

const tagOptions = reactive({
  categories: [],
  skills: [],
  volunteerTypes: [],
  serviceSlots: [],
})

const imageFile = ref(null)
const uploading = ref(false)

const startDateOptions = (dateStr) => {
  return dateStr >= date.formatDate(Date.now(), 'YYYY/MM/DD')
}

const deadlineOptions = (dateStr) => {
  if (!form.serviceDateRange.start) return true
  const targetDate = new Date(form.serviceDateRange.start)
  return dateStr <= date.formatDate(targetDate, 'YYYY/MM/DD')
}

const loadTagOptions = async () => {
  try {
    const [catRes, skillRes, typeRes, slotRes] = await Promise.all([
      getCategories(),
      getSkills(),
      getVolunteerTypes(),
      getServiceSlots(),
    ])
    tagOptions.categories = catRes.data.result.map((c) => ({ label: c.name, value: c._id }))
    tagOptions.skills = skillRes.data.result.map((s) => ({ label: s.name, value: s._id }))
    tagOptions.volunteerTypes = typeRes.data.result.map((t) => ({ label: t.name, value: t._id }))
    tagOptions.serviceSlots = slotRes.data.result.map((s) => ({ label: s.name, value: s._id }))
  } catch (error) {
    console.error('Failed to load tag options', error)
  }
}

const handleUpload = async (file) => {
  if (!file) return
  uploading.value = true
  try {
    const { data } = await uploadImage(file)
    form.imgUrl = data.result
    $q.notify({ color: 'positive', message: '圖片上傳成功', icon: 'cloud_done' })
  } catch (error) {
    console.error(error)
    $q.notify({ color: 'negative', message: '圖片上傳失敗' })
  } finally {
    uploading.value = false
  }
}

const handleRemoveImage = () => {
  form.imgUrl = ''
  imageFile.value = null
}

const onRejected = (rejectedEntries) => {
  rejectedEntries.forEach((entry) => {
    if (entry.failedPropValidation === 'max-file-size') {
      $q.notify({
        color: 'negative',
        message: '檔案大小不可超過 2MB',
        icon: 'error',
      })
    }
  })
}

watch(
  () => props.initialData,
  (newData) => {
    if (newData && newData._id) {
      form.title = newData.title || ''
      form.imgUrl = newData.imgUrl || ''
      form.location = newData.location || ''
      form.serviceTarget = newData.serviceTarget || ''

      // 格式化日期時間字串 (YYYY-MM-DD HH:mm) 以配合 Quasar mask
      const formatDateTime = (isoStr) => {
        if (!isoStr) return ''
        const d = new Date(isoStr)
        const pad = (n) => n.toString().padStart(2, '0')
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
      }

      form.serviceDateRange = {
        start: formatDateTime(newData.serviceDateRange?.start),
        end: formatDateTime(newData.serviceDateRange?.end),
      }
      form.registrationDeadline = newData.registrationDeadline?.split('T')[0] || ''
      form.maxParticipants = newData.maxParticipants || 0
      form.hours = newData.hours || 0
      form.description = newData.description || ''
      form.category = newData.category?._id || newData.category || null
      form.volunteerType = newData.volunteerType?._id || newData.volunteerType || null
      form.serviceSlots = newData.serviceSlots?.map((s) => s._id || s) || []
      form.requiredSkills = newData.requiredSkills?.map((s) => s._id || s) || []
      form.hasAttendance = newData.hasAttendance || false
    }
  },
  { immediate: true, deep: true },
)

const onSubmit = () => {
  // 若有出席紀錄，移除 hours 避免觸發後端防禦機制 (即使值未變，傳送該欄位仍可能觸發檢查)
  const submitData = { ...form }
  if (form.hasAttendance) {
    delete submitData.hours
  }
  emit('submit', submitData)
}

onMounted(loadTagOptions)
</script>
