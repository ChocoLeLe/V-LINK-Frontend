import { api } from 'boot/axios'

export const getCategories = () => api.get('/system/category')

export const getSkills = () => api.get('/system/skill')

export const getVolunteerTypes = () => api.get('/system/volunteerType')

export const getServiceSlots = () => api.get('/system/serviceSlot')
