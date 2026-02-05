<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-md justify-center">
      <div class="col-12 col-md-8">
        <q-card flat bordered class="q-pa-lg shadow-1">
          <q-card-section class="row items-center q-pb-none">
            <div class="text-h6 text-bold">編輯個人資料</div>
            <q-space />
            <q-btn flat icon="arrow_back" label="返回個人檔案" to="/my/profile" color="grey-7" />
          </q-card-section>

          <q-card-section class="row q-col-gutter-md">
            <div class="col-12 q-mb-md">
              <div class="row items-center justify-center q-gutter-x-xl">
                <q-avatar size="120px" class="shadow-2 border-primary">
                  <img
                    :src="
                      auth.user.avatar ||
                      `https://api.dicebear.com/9.x/thumbs/svg?seed=${auth.user.account}`
                    "
                    style="object-fit: cover; width: 100%; height: 100%"
                  />
                </q-avatar>
                <div class="column q-gutter-sm">
                  <q-btn
                    outline
                    color="primary"
                    icon="upload_file"
                    label="更換頭像"
                    @click="triggerUpload"
                    size="sm"
                    :loading="uploading"
                  />
                  <q-btn
                    v-if="auth.user.avatar"
                    outline
                    color="negative"
                    icon="delete_forever"
                    label="移除頭像"
                    @click="handleRemoveAvatar"
                    size="sm"
                    :loading="uploading"
                  />
                  <div class="text-caption text-grey q-mt-sm">檔案上限 2MB</div>
                </div>
              </div>
              <input
                type="file"
                ref="fileInput"
                style="display: none"
                accept="image/*"
                @change="handleAvatarUpload"
              />
            </div>

            <div class="col-12 col-sm-6">
              <q-input v-model="profileForm.name" label="姓名" filled dense />
            </div>
            <div class="col-12 col-sm-6">
              <q-input v-model="profileForm.phone" label="聯絡電話" filled dense />
            </div>
            <div class="col-12">
              <q-input
                v-model="profileForm.email"
                label="電子信箱"
                filled
                dense
                readonly
                hint="Email 註冊後不可更改"
              />
            </div>

            <div class="col-12 col-sm-6">
              <q-select
                v-model="profileForm.gender"
                label="性別"
                filled
                dense
                :options="['男', '女', '其他']"
              />
            </div>
            <div class="col-12 col-sm-6">
              <q-select
                v-model="profileForm.ageGroup"
                label="年齡層"
                filled
                dense
                :options="ageGroupOptions"
              />
            </div>

            <div class="col-12">
              <q-select
                v-model="profileForm.skills"
                label="我的專長技能"
                multiple
                use-chips
                filled
                dense
                :options="allSkills"
                option-label="name"
                option-value="name"
                emit-value
                map-options
              />
            </div>

            <div class="col-12">
              <q-input
                v-model="profileForm.bio"
                label="自我介紹"
                type="textarea"
                filled
                rows="3"
                placeholder="介紹一下你自己，讓媒合單位更了解你..."
              />
            </div>
          </q-card-section>

          <q-card-actions align="center">
            <q-btn
              color="primary"
              label="儲存並返回"
              :loading="saving"
              @click="saveProfile"
              :class="['text-bold', $q.screen.lt.sm ? 'q-px-lg' : 'q-px-xl']"
            />
          </q-card-actions>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useAuthStore } from 'src/stores/auth'
import { useRouter } from 'vue-router'
import { getSkills } from 'src/api/system'
import { updateProfile } from 'src/api/user'
import { uploadImage } from 'src/api/upload'
import { useQuasar } from 'quasar'

const auth = useAuthStore()
const router = useRouter()
const $q = useQuasar()

const profileForm = reactive({
  name: '',
  phone: '',
  gender: '',
  ageGroup: '',
  skills: [],
  bio: '',
  email: '',
})

const allSkills = ref([])
const saving = ref(false)
const uploading = ref(false)
const fileInput = ref(null)
const ageGroupOptions = ['15-22歲 青年', '23-45歲 青壯年', '46-64歲 中壯年', '65歲以上 高齡/銀髮']

const syncFormData = () => {
  if (!auth.user) return
  profileForm.name = auth.user.name || ''
  profileForm.phone = auth.user.phone || ''
  profileForm.gender = auth.user.gender || '其他'
  profileForm.ageGroup = auth.user.ageGroup || ''
  profileForm.bio = auth.user.bio || ''
  profileForm.email = auth.user.email || ''
  profileForm.skills = auth.user.skills
    ? auth.user.skills.map((s) => (typeof s === 'object' ? s.name : s))
    : []
}

const fetchSkills = async () => {
  try {
    const { data } = await getSkills()
    allSkills.value = data.result
  } catch (err) {
    console.error('無法取得技能清單', err)
  }
}

const triggerUpload = () => {
  fileInput.value.click()
}

const handleAvatarUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  if (file.size > 2 * 1024 * 1024) {
    $q.notify({
      color: 'negative',
      message: '檔案大小不可超過 2MB',
      icon: 'error',
    })
    event.target.value = ''
    return
  }

  uploading.value = true
  try {
    const { data } = await uploadImage(file)
    await updateProfile({ avatar: data.result })
    await auth.fetchProfile()
    $q.notify({ color: 'positive', message: '頭像更新成功', icon: 'check' })
  } catch (error) {
    console.error(error)
    $q.notify({ color: 'negative', message: '頭像上傳失敗' })
  } finally {
    uploading.value = false
    event.target.value = ''
  }
}

const handleRemoveAvatar = async () => {
  $q.dialog({
    title: '移除頭像',
    message: '確定要移除目前的頭像嗎？',
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    uploading.value = true
    try {
      await updateProfile({ avatar: '' })
      await auth.fetchProfile()
      $q.notify({ color: 'positive', message: '頭像已移除', icon: 'check' })
    } catch (error) {
      console.error(error)
      $q.notify({ color: 'negative', message: '移除失敗' })
    } finally {
      uploading.value = false
    }
  })
}

const saveProfile = async () => {
  saving.value = true
  try {
    await updateProfile(profileForm)
    await auth.fetchProfile()
    $q.notify({ color: 'positive', message: '個人檔案更新成功', icon: 'check', timeout: 1000 })
    router.push('/my/profile')
  } catch (err) {
    console.error('儲存失敗：', err)
    $q.notify({ color: 'negative', message: '儲存失敗' })
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  try {
    await auth.fetchProfile()
    await fetchSkills()
    syncFormData()
  } catch (error) {
    console.error('頁面初始化失敗:', error)
  }
})
</script>

<style scoped>
.border-primary {
  border: 2px solid #1976d2;
}
.relative-position {
  position: relative;
}
</style>
