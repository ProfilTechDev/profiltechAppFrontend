<script setup lang="ts">
import { type Department, getDepartmentMeta } from '~/config/department'

const props = defineProps<{
  department: Department | null | undefined
}>()

const meta = computed(() => getDepartmentMeta(props.department))
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
