<script setup lang="ts">
import { type PackingStatus, getPackingStatusMeta } from '~/config/packing-status'

const props = defineProps<{
  status: PackingStatus | null | undefined
}>()

const meta = computed(() => getPackingStatusMeta(props.status))
</script>

<template>
  <UBadge
    v-if="meta"
    :color="meta.color"
    :icon="meta.icon"
    variant="subtle"
    size="sm"
  >
    {{ meta.label }}
  </UBadge>
  <span
    v-else
    class="text-muted text-xs"
  >—</span>
</template>
