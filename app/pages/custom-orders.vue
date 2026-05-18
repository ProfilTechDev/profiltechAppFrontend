<script setup lang="ts">
import type { TableColumn, TableRow } from '@nuxt/ui'
import type { CustomOrder } from '~/composables/useCustomOrders'
import { getSubmissionStatusMeta } from '~/config/submission-status'

const page = ref(1)
const { orders, meta, status, refresh } = useCustomOrders(page)

const columns: TableColumn<CustomOrder>[] = [
  { accessorKey: 'wc_order_id', header: 'Order #' },
  { accessorKey: 'customer', header: 'Kunde' },
  { accessorKey: 'submission_status', header: 'Status' },
  { accessorKey: 'date_created', header: 'Ordredato' },
  { accessorKey: 'total', header: 'Beløb' }
]

function formatDate(iso: string | null) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('da-DK', { dateStyle: 'short' })
}

function formatCurrency(amount: string, currency: string) {
  return new Intl.NumberFormat('da-DK', {
    style: 'currency',
    currency
  }).format(Number(amount))
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
        <template #customer-cell="{ row }">
          {{ row.original.customer?.name ?? '(ukendt kunde)' }}
        </template>

        <template #submission_status-cell="{ row }">
          <UBadge
            variant="subtle"
            :color="getSubmissionStatusMeta(row.original.submission_status).color"
            :label="getSubmissionStatusMeta(row.original.submission_status).label"
          />
        </template>

        <template #date_created-cell="{ row }">
          {{ formatDate(row.original.date_created) }}
        </template>

        <template #total-cell="{ row }">
          {{ formatCurrency(row.original.total, row.original.currency) }}
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
