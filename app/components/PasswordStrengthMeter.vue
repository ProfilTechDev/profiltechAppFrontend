<script setup lang="ts">
import { PASSWORD_CRITERIA, passwordScore } from '~/utils/password-policy'

const props = defineProps<{
  password: string
}>()

const total = PASSWORD_CRITERIA.length

const score = computed(() => passwordScore(props.password))

const segments = computed(() => Array.from({ length: total }, (_, i) => i < score.value))

// Color the bar based on how many criteria pass. 5/5 -> green,
// 3-4 -> amber, anything less -> red.
const meterColor = computed(() => {
  if (score.value === total) {
    return 'bg-success'
  }
  if (score.value >= 3) {
    return 'bg-warning'
  }
  return 'bg-error'
})

const statusLabel = computed(() => {
  if (props.password.length === 0) {
    return 'Vælg en adgangskode'
  }
  if (score.value === total) {
    return 'Stærk adgangskode'
  }
  if (score.value >= 3) {
    return 'Acceptabel — kan forbedres'
  }
  return 'Svag adgangskode'
})

const criteria = computed(() =>
  PASSWORD_CRITERIA.map(c => ({
    ...c,
    passed: c.test(props.password)
  }))
)
</script>

<template>
  <div class="space-y-3">
    <div class="space-y-1.5">
      <div class="flex gap-1">
        <div
          v-for="(filled, i) in segments"
          :key="i"
          class="h-1.5 flex-1 rounded-full transition-colors"
          :class="filled ? meterColor : 'bg-elevated'"
        />
      </div>
      <p class="text-xs text-muted">
        {{ statusLabel }}
      </p>
    </div>

    <ul class="space-y-1">
      <li
        v-for="c in criteria"
        :key="c.key"
        class="flex items-center gap-2 text-xs"
        :class="c.passed ? 'text-success' : 'text-muted'"
      >
        <UIcon
          :name="c.passed ? 'i-lucide-check' : 'i-lucide-circle'"
          class="size-3.5 shrink-0"
        />
        {{ c.label }}
      </li>
    </ul>
  </div>
</template>
