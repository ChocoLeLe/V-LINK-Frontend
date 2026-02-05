<template>
  <q-page padding>
    <div class="row items-center q-mb-md">
      <div class="text-h5 text-bold">標籤維護</div>
      <q-space />
      <q-btn
        color="primary"
        outline
        icon="add"
        :label="$q.screen.gt.sm ? '新增' + currentLabel : ''"
        @click="openDialog()"
      />
    </div>

    <q-tabs
      v-model="currentTab"
      dense
      class="text-grey"
      :class="{ 'no-wrap': $q.screen.lt.md }"
      active-color="primary"
      indicator-color="primary"
      :align="$q.screen.gt.sm ? 'justify' : 'left'"
      narrow-indicator
    >
      <q-tab name="skill" label="技能 (Skill)" />
      <q-tab name="volunteerType" label="志工類型 (VolunteerType)" />
      <q-tab name="category" label="分類 (Category)" />
      <q-tab name="serviceSlot" label="服務時段 (ServiceSlot)" />
    </q-tabs>

    <q-separator />

    <div v-if="loading" class="q-pa-xl text-center">
      <q-spinner-dots color="primary" size="40px" />
    </div>

    <div v-else class="q-mt-md">
      <!-- Mobile View -->
      <div v-if="$q.screen.lt.md">
        <div v-if="tableData.length === 0" class="text-center text-grey q-pa-md">尚無資料</div>
        <q-card v-for="item in tableData" :key="item._id" flat bordered class="q-mb-md shadow-1">
          <q-item class="q-py-md">
            <q-item-section avatar>
              <q-avatar color="primary" text-color="white" icon="label" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-bold text-h6">{{ item.name }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-separator />
          <q-card-actions align="right">
            <q-btn flat color="primary" icon="edit" label="編輯" @click="openDialog(item)" />
            <q-btn flat color="negative" icon="delete" label="刪除" @click="confirmDelete(item)" />
          </q-card-actions>
        </q-card>
      </div>

      <!-- Desktop View -->
      <q-table
        v-else
        flat
        bordered
        :rows="tableData"
        :columns="columns"
        row-key="_id"
        :loading="false"
        :pagination="{ rowsPerPage: 10 }"
      >
        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <q-btn flat round color="primary" icon="edit" size="sm" @click="openDialog(props.row)">
              <q-tooltip>編輯</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              color="negative"
              icon="delete"
              size="sm"
              @click="confirmDelete(props.row)"
            >
              <q-tooltip>刪除</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </div>

    <!-- 新增/修改 Dialog -->
    <q-dialog v-model="dialog.show">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">{{ dialog.isEdit ? '修改' : '新增' }} {{ currentLabel }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            v-model="dialog.form.name"
            label="名稱"
            autofocus
            :rules="[(val) => !!val || '名稱為必填']"
          />
          <!-- 若 ServiceSlot 需要額外欄位(如時間)，可在此處擴充 -->
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="取消" v-close-popup />
          <q-btn flat label="儲存" @click="saveData" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { getTags, createTag, updateTag, deleteTag } from 'src/api/tags'

const $q = useQuasar()

// --- 狀態定義 ---
const currentTab = ref('skill')
const loading = ref(false)
const tableData = ref([])

const dialog = ref({
  show: false,
  isEdit: false,
  form: { _id: null, name: '' },
})

// API 設定對應表
const config = {
  skill: { label: '技能' },
  volunteerType: { label: '志工類型' },
  category: { label: '分類' },
  serviceSlot: { label: '服務時段' },
}

const currentConfig = computed(() => config[currentTab.value])
const currentLabel = computed(() => currentConfig.value.label)

const columns = [
  { name: 'name', label: '名稱', align: 'left', field: 'name', sortable: true },
  { name: 'actions', label: '操作', align: 'right', field: 'actions' },
]

// --- 方法 ---
const fetchData = async () => {
  loading.value = true
  try {
    const { data } = await getTags(currentTab.value)
    tableData.value = data.result || []
  } catch (error) {
    console.error('讀取標籤失敗:', error)
    $q.notify({ type: 'negative', message: '讀取失敗' })
  } finally {
    loading.value = false
  }
}

const openDialog = (item = null) => {
  dialog.value.isEdit = !!item
  dialog.value.form = item ? { ...item } : { _id: null, name: '' }
  dialog.value.show = true
}

const saveData = async () => {
  if (!dialog.value.form.name) return
  try {
    const type = currentTab.value
    const { _id, name } = dialog.value.form

    if (dialog.value.isEdit) {
      await updateTag(type, _id, name)
      $q.notify({ type: 'positive', message: '更新成功' })
    } else {
      await createTag(type, name)
      $q.notify({ type: 'positive', message: '新增成功' })
    }
    dialog.value.show = false
    fetchData()
  } catch (error) {
    $q.notify({ type: 'negative', message: error.response?.data?.message || '儲存失敗' })
  }
}

const confirmDelete = (item) => {
  $q.dialog({
    title: '確認刪除',
    message: `確定要刪除 ${item.name} 嗎？`,
    cancel: { label: '取消', flat: true, color: 'grey' },
    ok: { label: '確定刪除', flat: true, color: 'negative' },
    persistent: true,
  }).onOk(async () => {
    try {
      await deleteTag(currentTab.value, item._id)
      $q.notify({ type: 'positive', message: '刪除成功' })
      fetchData()
    } catch (error) {
      $q.notify({ type: 'negative', message: error.response?.data?.message || '刪除失敗' })
    }
  })
}

watch(currentTab, fetchData)
onMounted(fetchData)
</script>

<style scoped>
/* 強制在小螢幕 (xs) 隱藏箭頭並開啟捲動 */
@media (max-width: 599px) {
  :deep(.q-tabs__arrow) {
    display: none;
  }
  :deep(.q-tabs__content) {
    overflow-x: auto;
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE/Edge */
  }
  :deep(.q-tabs__content)::-webkit-scrollbar {
    display: none; /* Chrome/Safari */
  }
}
</style>
