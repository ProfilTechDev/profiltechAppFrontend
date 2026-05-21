<script setup lang="ts">
import { PERMISSION_GROUPS, type PermissionKey } from '~/config/permissions'

const props = defineProps<{
  modelValue: PermissionKey[]
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: PermissionKey[]]
}>()

const groups = PERMISSION_GROUPS

function isChecked(key: PermissionKey): boolean {
  return props.modelValue.includes(key)
}

function toggle(key: PermissionKey, checked: boolean) {
  const next = checked
    ? [...new Set([...props.modelValue, key])]
    : props.modelValue.filter(p => p !== key)
  emit('update:modelValue', next)
}
</script>

<template>
  <div class="space-y-4">
    <div
      v-for="group in groups"
      :key="group.label"
      class="space-y-2"
    >
      <p class="text-xs font-semibold uppercase tracking-wide text-muted">
        {{ group.label }}
      </p>
      <div class="space-y-2 rounded-lg border border-default bg-elevated/20 p-3">
        <UCheckbox
          v-for="permission in group.permissions"
          :key="permission.key"
          :model-value="isChecked(permission.key)"
          :disabled="disabled"
          @update:model-value="(v) => toggle(permission.key, !!v)"
        >
          <template #label>
            <span class="text-sm font-medium text-default">{{ permission.label }}</span>
          </template>
          <template #description>
            <span class="text-xs text-muted">{{ permission.description }}</span>
          </template>
        </UCheckbox>
      </div>
    </div>
  </div>
</template>
