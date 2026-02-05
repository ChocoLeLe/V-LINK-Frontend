import { api } from 'boot/axios'

// 取得所有技能標籤 (供勾選用)
export const getAllSkills = () => api.get('/system/skill')
