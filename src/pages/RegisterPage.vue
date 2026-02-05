<template>
  <q-page class="flex flex-center bg-grey-2 q-py-xl q-px-md">
    <q-card class="register-card shadow-24">
      <q-card-section class="bg-primary text-white q-pa-lg text-center">
        <div class="text-h5 text-bold">V-Link 智慧志工媒合系統</div>
        <div class="text-subtitle2">建立您的志工帳號</div>
      </q-card-section>

      <q-card-section class="q-pa-xl">
        <div class="column items-center q-mb-xl">
          <q-avatar size="120px" class="shadow-5 bg-white border-primary">
            <img :src="diceBearUrl" />
          </q-avatar>
          <div class="text-caption text-grey-8 q-mt-sm text-bold">
            您的專屬系統頭像 (根據帳號生成)
          </div>
        </div>

        <q-form @submit="onRegister" class="row q-col-gutter-md">
          <div class="col-12 col-sm-6">
            <q-input
              v-model="form.account"
              label="帳號 (僅限英數字)"
              outlined
              dense
              prefix-icon="person"
              :rules="[
                (val) => !!val || '請輸入帳號',
                (val) => (val.length >= 4 && val.length <= 20) || '長度需為 4-20 個字',
                (val) => /^[a-zA-Z0-9]+$/.test(val) || '只能輸入英數字',
              ]"
            >
              <template v-slot:prepend><q-icon name="person" /></template>
            </q-input>
          </div>

          <div class="col-12 col-sm-6">
            <q-input
              v-model="form.password"
              label="密碼"
              type="password"
              outlined
              dense
              :rules="[(val) => !!val || '請輸入密碼', (val) => val.length >= 4 || '密碼至少 4 位']"
            >
              <template v-slot:prepend><q-icon name="lock" /></template>
            </q-input>
          </div>

          <div class="col-12 col-sm-6">
            <q-input
              v-model="form.name"
              label="真實姓名"
              outlined
              dense
              :rules="[(val) => !!val || '姓名必填']"
            >
              <template v-slot:prepend><q-icon name="badge" /></template>
            </q-input>
          </div>

          <div class="col-12 col-sm-6">
            <q-input v-model="form.phone" label="聯絡電話" outlined dense>
              <template v-slot:prepend><q-icon name="phone" /></template>
            </q-input>
          </div>

          <div class="col-12">
            <q-input
              v-model="form.email"
              label="電子信箱"
              type="email"
              outlined
              dense
              :rules="[
                (val) => !!val || '信箱必填',
                (val) => /.+@.+\..+/.test(val) || '格式不正確',
              ]"
            >
              <template v-slot:prepend><q-icon name="email" /></template>
            </q-input>
          </div>

          <div class="col-12 col-sm-5">
            <div class="text-subtitle2 q-mb-xs text-grey-7">性別</div>
            <q-option-group
              v-model="form.gender"
              :options="[
                { label: '男', value: '男' },
                { label: '女', value: '女' },
                { label: '其他', value: '其他' },
              ]"
              color="primary"
              inline
            />
          </div>

          <div class="col-12 col-sm-7">
            <q-select
              v-model="form.ageGroup"
              label="年齡層"
              outlined
              dense
              :options="['15-22歲 青年', '23-45歲 青壯年', '46-64歲 中壯年', '65歲以上 高齡/銀髮']"
              :rules="[(val) => !!val || '請選擇年齡層']"
            >
              <template v-slot:prepend><q-icon name="event" /></template>
            </q-select>
          </div>

          <div class="col-12 q-mt-md">
            <q-btn
              label="立即註冊並加入 V-Link"
              type="submit"
              color="primary"
              class="full-width text-bold"
              size="lg"
              :loading="loading"
            />
            <q-btn
              flat
              label="已有帳號？返回登入"
              color="grey-7"
              class="full-width q-mt-sm"
              to="/login"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { register } from 'src/api/user'

const router = useRouter()
const $q = useQuasar()
const loading = ref(false)

const form = reactive({
  account: '',
  password: '',
  name: '',
  email: '',
  phone: '',
  gender: '男', // 預設值
  ageGroup: '',
})

// DiceBear 頭像計算屬性
const diceBearUrl = computed(() => {
  const seed = form.account || 'v-link-seed'
  return `https://api.dicebear.com/9.x/thumbs/svg?seed=${seed}`
})

const onRegister = async () => {
  loading.value = true
  try {
    const submitData = {
      account: form.account,
      password: form.password,
      name: form.name,
      email: form.email,
      phone: form.phone || '',
      gender: form.gender || '其他',
      ageGroup: form.ageGroup || '',
      avatar: `https://api.dicebear.com/9.x/thumbs/svg?seed=${form.account}`,
    }

    await register(submitData)

    $q.notify({
      color: 'positive',
      message: '註冊成功！歡迎加入 V-Link',
      icon: 'check_circle',
    })

    router.push('/login')
  } catch (error) {
    // 這裡會捕捉到後端回傳的錯誤（例如帳號已重複）
    const message = error.response?.data?.message || '註冊失敗'
    $q.notify({ color: 'negative', message })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-card {
  width: 100%;
  max-width: 600px;
  border-radius: 20px;
  overflow: hidden;
}
.border-primary {
  border: 3px solid #1976d2;
}
</style>
