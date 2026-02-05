<template>
  <q-page class="flex flex-center bg-grey-2 q-py-xl q-px-md">
    <q-card class="login-card q-pa-lg shadow-2">
      <q-card-section class="text-center">
        <div class="text-h5 text-bold text-primary">V-Link 志工登入</div>
        <div class="text-caption text-grey-7 q-mt-sm">開始你的專業志願服務之旅</div>
      </q-card-section>

      <q-form @submit="handleLogin" class="q-gutter-md">
        <q-input
          v-model="form.account"
          label="帳號"
          filled
          lazy-rules
          :rules="[(val) => (val && val.length > 0) || '請輸入帳號']"
        >
          <template v-slot:prepend>
            <q-icon name="person" />
          </template>
        </q-input>

        <q-input
          v-model="form.password"
          label="密碼"
          type="password"
          filled
          lazy-rules
          :rules="[(val) => (val && val.length > 0) || '請輸入密碼']"
        >
          <template v-slot:prepend>
            <q-icon name="lock" />
          </template>
        </q-input>

        <div class="q-mt-lg">
          <q-btn
            label="登入系統"
            type="submit"
            color="primary"
            class="full-width"
            size="lg"
            :loading="loading"
          />
        </div>
      </q-form>

      <q-card-section class="text-center q-pt-none">
        <q-btn flat color="secondary" label="還沒有帳號？立即註冊" to="/register" />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const loading = ref(false)
const form = reactive({
  account: '',
  password: '',
})

const handleLogin = async () => {
  loading.value = true
  const success = await auth.login(form)
  loading.value = false

  if (success) {
    router.push('/')
  }
}

onMounted(() => {
  if (auth.isLoggedIn) {
    router.replace('/my/applications')
  }
})
</script>

<style scoped>
.login-card {
  width: 100%;
  max-width: 400px;
  border-radius: 12px;
}
</style>
