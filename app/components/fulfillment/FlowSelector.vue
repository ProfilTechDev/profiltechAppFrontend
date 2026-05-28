<script setup lang="ts">
import { DELIVERY_FLOW_OPTIONS, type DeliveryFlow } from '~/config/delivery-flow'

const props = defineProps<{
  modelValue: DeliveryFlow | null
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: DeliveryFlow | null]
}>()

const items = DELIVERY_FLOW_OPTIONS

const selected = computed(() => props.modelValue ?? 'none')

function onChange(value: string) {
  emit('update:modelValue', value === 'none' ? null : (value as DeliveryFlow))
}
</script>

<template>
  <USelect
    :model-value="selected"
    :items="items"
    value-key="value"
    :disabled="disabled"
    size="sm"
    class="w-44"
    @update:model-value="onChange"
  />
</template>
