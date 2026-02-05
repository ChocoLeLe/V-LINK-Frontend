// 統一管理全站標籤顏色

// 定義活動分類的安全色系 (排除 positive/green 與 orange，避免與媒合分數混淆)
const categoryPalette = [
  'teal',
  'indigo',
  'purple',
  'pink',
  'cyan',
  'blue',
  'deep-purple',
  'light-blue',
]

export const getMatchScoreColor = (score) => {
  if (score >= 80) return 'positive' // 綠色：高契合
  if (score >= 50) return 'orange' // 橘色：中等
  return 'grey' // 灰色：低
}

export const getCategoryColor = (name) => {
  if (!name) return 'blue'

  // 優先使用定義好的語意化顏色 (保留既有設計)
  const predefined = {
    生態環保: 'teal',
    文化教育: 'indigo',
    老人關懷: 'purple',
    弱勢助學: 'pink',
    社區服務: 'cyan',
  }
  if (predefined[name]) return predefined[name]

  // 若為新標籤，透過雜湊演算法自動分配一個固定顏色
  // 這樣可以確保同一個新標籤 (例如 "醫療服務") 永遠會拿到同一個顏色，且不會是綠色
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % categoryPalette.length
  return categoryPalette[index]
}

export const getVolunteerTypeColor = () => {
  return 'brown' // 統一志工類型為棕色，與其他區隔
}
