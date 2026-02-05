import { api } from 'boot/axios'

// 這個物件的 `key` 必須與 AdminTagsPage.vue 中的 <q-tab> 的 `name` 屬性完全對應
const tagEndpoints = {
  skill: '/system/skill',
  volunteerType: '/system/volunteerType',
  category: '/system/category',
  serviceSlot: '/system/serviceSlot',
}

export const getTags = (type) => {
  const endpoint = tagEndpoints[type]
  return api.get(endpoint)
}

export const createTag = (type, name) => {
  const endpoint = tagEndpoints[type]
  return api.post(endpoint, { name })
}

export const updateTag = (type, id, name) => {
  const endpoint = tagEndpoints[type]
  return api.patch(`${endpoint}/${id}`, { name })
}

export const deleteTag = (type, id) => {
  const endpoint = tagEndpoints[type]
  return api.delete(`${endpoint}/${id}`)
}
