import dayjs from 'dayjs'

export const formatDate = (date, format = 'YYYY-MM-DD HH:mm') => {
  return date ? dayjs(date).format(format) : '未定'
}
