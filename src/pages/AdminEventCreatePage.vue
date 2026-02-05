<template>
  <q-page class="q-pa-md">
    <div class="text-h5 text-bold q-mb-md">發佈新活動</div>
    <q-card flat bordered>
      <q-card-section>
        <EventForm @submit="handleSubmit" :loading="submitting" />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import EventForm from 'src/components/EventForm.vue'
import { createEvent } from 'src/api/event'

const router = useRouter()
const $q = useQuasar()
const submitting = ref(false)

const handleSubmit = async (formData) => {
  submitting.value = true
  try {
    await createEvent(formData)
    $q.notify({ type: 'positive', message: '活動已成功發佈！' })
    router.push('/admin/events')
  } catch (error) {
    console.error('Create event failed', error)
    $q.notify({ type: 'negative', message: error.response?.data?.message || '發佈失敗' })
  } finally {
    submitting.value = false
  }
}
</script>
