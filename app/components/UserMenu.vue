<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

defineProps<{
  collapsed?: boolean
}>()

interface SanctumUser {
  name?: string
  email?: string
}

const { user, logout } = useSanctumAuth<SanctumUser>()

const displayName = computed(() => user.value?.name ?? user.value?.email ?? 'Bruger')
const displayEmail = computed(() => user.value?.email ?? '')

const initials = computed(() => {
  const source = user.value?.name ?? user.value?.email ?? ''
  return source
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part.charAt(0).toUpperCase())
    .join('') || '?'
})

const items = computed<DropdownMenuItem[][]>(() => [
  [
    {
      type: 'label',
      label: displayName.value,
      slot: 'account'
    }
  ],
  [
    {
      label: 'Log ud',
      icon: 'i-lucide-log-out',
      color: 'error',
      onSelect: async () => {
        await logout()
      }
    }
  ]
])
</script>

<template>
  <UDropdownMenu
    :items="items"
    :content="{ align: 'end', side: 'top', sideOffset: 8 }"
    :ui="{ content: 'w-60' }"
  >
    <UButton
      color="neutral"
      variant="ghost"
      :block="!collapsed"
      :square="collapsed"
      :ui="{
        base: collapsed ? 'justify-center' : 'justify-start gap-2.5 px-2 py-1.5'
      }"
    >
      <UAvatar :alt="displayName" :text="initials" size="sm" />
      <template v-if="!collapsed">
        <span class="flex-1 min-w-0 text-left">
          <span class="block truncate text-sm font-medium text-default">{{ displayName }}</span>
          <span v-if="displayEmail" class="block truncate text-xs text-muted font-normal">{{ displayEmail }}</span>
        </span>
        <UIcon name="i-lucide-chevrons-up-down" class="size-4 shrink-0 text-muted" />
      </template>
    </UButton>

    <template #account>
      <div class="flex flex-col gap-0.5">
        <span class="truncate text-sm font-medium text-default">{{ displayName }}</span>
        <span v-if="displayEmail" class="truncate text-xs text-muted font-normal">{{ displayEmail }}</span>
      </div>
    </template>
  </UDropdownMenu>
</template>
