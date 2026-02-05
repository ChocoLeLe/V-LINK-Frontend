<template>
  <q-card
    class="column full-height cursor-pointer hover-card transition-generic"
    @click="$router.push(`/events/${props.event._id}`)"
  >
    <q-img
      :src="props.event.imgUrl || `https://picsum.photos/seed/${props.event._id}/800/600`"
      :ratio="16 / 9"
    >
      <div class="absolute-top-right q-pa-xs bg-transparent column items-end q-gutter-y-xs">
        <q-badge
          v-if="auth.isLoggedIn"
          :color="getMatchScoreColor(matchScore)"
          class="q-py-xs q-px-sm"
        >
          契合度 {{ matchScore }}%
        </q-badge>
        <q-badge :color="getCategoryColor(props.event.category?.name)" class="q-py-xs q-px-sm">
          {{ props.event.category?.name || '未分類' }}
        </q-badge>
        <q-badge
          :color="getVolunteerTypeColor(props.event.volunteerType?.name)"
          class="q-py-xs q-px-sm"
        >
          {{ props.event.volunteerType?.name || '一般志工' }}
        </q-badge>
      </div>
      <div
        class="absolute-bottom text-subtitle2 text-white q-pa-xs row items-center"
        style="background: rgba(0, 0, 0, 0.6)"
      >
        <q-icon name="place" size="xs" class="q-mr-xs" />
        <div class="ellipsis">{{ props.event.location }}</div>
      </div>
    </q-img>

    <q-card-section class="q-pb-sm col-grow">
      <div class="text-h6 ellipsis-2-lines" :title="event.title">{{ event.title }}</div>
      <div class="text-caption text-grey row items-center q-mt-xs">
        <q-icon name="event" size="xs" />
        {{ formatDate(props.event.serviceDateRange?.start) }}
      </div>
      <div class="row items-end justify-between q-mt-sm no-wrap">
        <div class="row q-gutter-xs col" style="overflow: hidden">
          <q-chip
            v-for="skill in props.event.requiredSkills"
            :key="skill._id"
            size="sm"
            color="blue-1"
            text-color="blue-8"
            class="q-ma-none q-mr-xs q-mb-xs"
          >
            {{ skill.name }}
          </q-chip>
          <span v-if="!props.event.requiredSkills?.length" class="text-caption text-grey-5"
            >不限技能</span
          >
        </div>
        <div class="col-auto text-caption q-ml-sm text-right" style="white-space: nowrap">
          <span
            :class="
              props.event.approvedCount >= props.event.maxParticipants
                ? 'text-negative text-bold'
                : 'text-primary'
            "
          >
            {{ props.event.approvedCount }} / {{ props.event.maxParticipants }}
          </span>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { toRefs } from 'vue'
import { useAuthStore } from 'src/stores/auth'
import { formatDate } from 'src/utils/formatter.js'
import {
  getCategoryColor,
  getMatchScoreColor,
  getVolunteerTypeColor,
} from 'src/utils/tag-colors.js'
import { useMatchScore } from 'src/composables/useMatchScore.js'

const props = defineProps({
  event: {
    type: Object,
    required: true,
  },
})

const auth = useAuthStore()
const { event } = toRefs(props)
const { matchScore } = useMatchScore(event)
</script>

<style scoped>
.hover-card {
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}
.hover-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}
</style>
