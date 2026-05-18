<script setup lang="ts">
import type { OrderAttribute } from '~/composables/useCustomOrders'

defineProps<{
  attributes: OrderAttribute[]
}>()

const { data: colors } = useColors()

function colorFor(attr: OrderAttribute): string | null {
  if (!attr.raw_value) return null
  return colors.value?.[attr.raw_value] ?? null
}
</script>

<template>
  <ul v-if="attributes.length" class="space-y-1 text-xs">
    <li
      v-for="attr in attributes"
      :key="attr.key"
      class="flex items-center gap-2"
    >
      <span
        v-if="colorFor(attr)"
        :style="{ backgroundColor: colorFor(attr) ?? '' }"
        class="inline-block size-3 rounded border border-default"
      />
      <span class="text-muted">{{ attr.label }}:</span>
      <span>{{ attr.value }}</span>
    </li>
  </ul>
</template>
