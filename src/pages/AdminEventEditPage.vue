<template>
  <q-page class="q-pa-md">
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h5 text-bold">編輯活動</div>
      <q-btn
        color="negative"
        icon="delete"
        label="刪除活動"
        outline
        @click="handleDelete"
        :disable="submitting"
      />
    </div>
    <q-card flat bordered>
      <q-card-section v-if="loading" class="text-center">
        <q-spinner-dots color="primary" size="40px" />
      </q-card-section>
      <q-card-section v-else>
        <EventForm
          is-edit-mode
          :initial-data="eventData"
          :loading="submitting"
          @submit="handleSubmit"
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import EventForm from 'src/components/EventForm.vue'
import { getEventById, updateEvent, deleteEvent } from 'src/api/event'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const eventData = ref({})
const loading = ref(true)
const submitting = ref(false)
const eventId = route.params.id

onMounted(async () => {
  try {
    const { data } = await getEventById(eventId)
    eventData.value = data.result
  } catch (error) {
    console.error('Failed to fetch event data', error)
    $q.notify({ type: 'negative', message: '讀取活動資料失敗' })
  } finally {
    loading.value = false
  }
})

const handleSubmit = async (formData) => {
  submitting.value = true
  try {
    await updateEvent(eventId, formData)
    $q.notify({ type: 'positive', message: '活動已成功更新！' })
    router.push('/admin/events')
  } catch (error) {
    console.error('Update event failed', error)
    $q.notify({ type: 'negative', message: error.response?.data?.message || '更新失敗' })
  } finally {
    submitting.value = false
  }
}

const handleDelete = () => {
  $q.dialog({
    title: '刪除確認',
    message: '確定要刪除此活動嗎？此動作無法復原，且相關報名紀錄也可能受影響。',
    cancel: { label: '取消', flat: true, color: 'grey' },
    ok: { label: '確定刪除', flat: true, color: 'negative' },
    persistent: true,
  }).onOk(async () => {
    submitting.value = true
    try {
      await deleteEvent(eventId)
      $q.notify({ type: 'positive', message: '活動已成功刪除' })
      router.replace('/admin/events')
    } catch (error) {
      console.error('Delete event failed', error)
      $q.notify({ type: 'negative', message: error.response?.data?.message || '刪除失敗' })
    } finally {
      submitting.value = false
    }
  })
}
</script>
