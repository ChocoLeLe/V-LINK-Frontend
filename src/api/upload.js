import { api } from 'src/boot/axios'

export const uploadImage = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  return api.post('/user/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}
