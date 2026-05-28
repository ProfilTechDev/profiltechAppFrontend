<script setup lang="ts">
import { type DeliveryFlow, getDeliveryFlowMeta } from '~/config/delivery-flow'

const props = defineProps<{
  flow: DeliveryFlow | null | undefined
}>()

const meta = computed(() => getDeliveryFlowMeta(props.flow))
</script>

<template>
  <UBadge
    :color="meta.color"
    :icon="meta.icon"
    variant="subtle"
    size="sm"
  >
    {{ meta.label }}
  </UBadge>
</template>
