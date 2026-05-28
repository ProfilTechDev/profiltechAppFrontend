<script setup lang="ts">
withDefaults(defineProps<{
  searchPlaceholder?: string
  searchable?: boolean
}>(), {
  searchPlaceholder: 'Søg…',
  searchable: true
})

const search = defineModel<string>('search', { default: '' })
</script>

<template>
  <div class="flex flex-wrap items-center justify-between gap-3 border-b border-default bg-elevated/30 p-4">
    <UInput
      v-if="searchable"
      v-model="search"
      :placeholder="searchPlaceholder"
      icon="i-lucide-search"
      size="lg"
      class="min-w-60 w-full max-w-80"
    />
    <span
      v-else
      class="hidden"
    />

    <div class="flex flex-wrap items-center gap-3">
      <slot />
    </div>
  </div>
</template>
