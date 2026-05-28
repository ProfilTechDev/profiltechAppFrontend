<script setup lang="ts">
import type { PaginationMeta } from '~/composables/useCustomOrders'
import { PER_PAGE_OPTIONS } from '~/config/table-ui'

defineProps<{
  meta: PaginationMeta | undefined
  /** Show the per-page dropdown. Defaults to `true`. */
  showPerPage?: boolean
}>()

const page = defineModel<number>('page', { required: true })
const perPage = defineModel<number>('perPage')
</script>

<template>
  <div
    v-if="meta"
    class="grid grid-cols-1 items-center gap-3 border-t border-default px-4 py-3 sm:grid-cols-3"
  >
    <span class="text-sm text-muted sm:justify-self-start">
      Viser {{ meta.from ?? 0 }}–{{ meta.to ?? 0 }} af {{ meta.total }}
    </span>

    <UPagination
      v-if="meta.last_page > 1"
      v-model:page="page"
      :total="meta.total"
      :items-per-page="meta.per_page"
      size="sm"
      class="sm:justify-self-center"
    />
    <span
      v-else
      class="hidden sm:block"
    />

    <div
      v-if="showPerPage !== false"
      class="flex items-center gap-2 sm:justify-self-end"
    >
      <span class="text-sm text-muted">Pr. side</span>
      <USelect
        v-model="perPage"
        :items="PER_PAGE_OPTIONS"
        size="sm"
        class="w-20"
      />
    </div>
    <span
      v-else
      class="hidden sm:block"
    />
  </div>
</template>
