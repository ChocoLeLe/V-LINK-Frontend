import { computed } from 'vue'
import { useAuthStore } from 'src/stores/auth'

export function useMatchScore(event) {
  const auth = useAuthStore()

  // 計算志工技能與活動需求技能的匹配度 (0-100)
  const matchScore = computed(() => {
    if (!auth.isLoggedIn || !event.value) return 0
    const requiredSkills = event.value.requiredSkills || []
    if (requiredSkills.length === 0) return 100

    const userSkills = (auth.user.skills || []).map((s) =>
      typeof s === 'object' ? s.name : String(s),
    )
    const reqSkills = requiredSkills.map((s) => (typeof s === 'object' ? s.name : String(s)))

    const matches = reqSkills.filter((s) => userSkills.includes(s))
    return Math.round((matches.length / reqSkills.length) * 100)
  })

  return { matchScore }
}
