<script setup lang="ts">
import type { TableColumn, TableRow } from '@nuxt/ui'
import type { CustomOrder } from '~/composables/useCustomOrders'

const page = ref(1)
const { orders, meta, status, refresh } = useCustomOrders(page)

const columns: TableColumn<CustomOrder>[] = [
  { accessorKey: 'wc_order_id', header: 'Order #' },
  { accessorKey: 'wc_modified_at', header: 'Modified' }
]

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('da-DK', {
    dateStyle: 'short',
    timeStyle: 'short'
  })
}

const isModalOpen = ref(false)
const selectedOrder = ref<CustomOrder | null>(null)

function onSelect(_e: Event, row: TableRow<CustomOrder>) {
  selectedOrder.value = row.original
  isModalOpen.value = true
}
</script>

<template>
  <UDashboardPanel id="custom-orders">
    <template #header>
      <UDashboardNavbar title="Custom orders">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UTable
        :data="orders"
        :columns="columns"
        :loading="status === 'pending'"
        :ui="{ 
          tr: 'cursor-pointer',
        }"
        @select="onSelect"
      >
        <template #wc_modified_at-cell="{ row }">
          {{ formatDate(row.original.wc_modified_at) }}
        </template>
      </UTable>

      <div v-if="meta && meta.last_page > 1" class="flex justify-end pt-4">
        <UPagination
          v-model:page="page"
          :total="meta.total"
          :items-per-page="meta.per_page"
        />
      </div>

      <CustomOrdersSendDialog
        v-model:open="isModalOpen"
        :order="selectedOrder"
        @sent="refresh"
      />
    </template>
  </UDashboardPanel>
</template>
