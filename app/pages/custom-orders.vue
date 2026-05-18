<script setup lang="ts">
import type { TableColumn, TableRow } from '@nuxt/ui'
import type { CustomOrder } from '~/composables/useCustomOrders'
import { getSubmissionStatusMeta } from '~/config/submission-status'

const page = ref(1)
const statusFilter = ref('all')
const search = ref('')
const apiStatusFilter = computed(() => statusFilter.value === 'all' ? '' : statusFilter.value)
const { orders, meta, status, refresh } = useCustomOrders({ page, status: apiStatusFilter, search })

const statusOptions = [
  { label: 'Alle status', value: 'all' },
  { label: 'Kladde', value: 'draft' },
  { label: 'I kø', value: 'queued' },
  { label: 'Sendt', value: 'sent' },
  { label: 'Fejlet', value: 'failed' }
]

watch([statusFilter, search], () => {
  page.value = 1
})

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
      <div class="overflow-hidden rounded-lg border border-default bg-default shadow-xs">
        <div class="flex flex-wrap items-center justify-between gap-3 border-b border-default bg-elevated/30 p-4">
          <UInput
            v-model="search"
            placeholder="Søg på ordre, kunde eller email"
            icon="i-lucide-search"
            size="lg"
            class="min-w-60 w-full max-w-80"
          />
          <USelect
            v-model="statusFilter"
            :items="statusOptions"
            icon="i-lucide-filter"
            size="lg"
            class="w-56"
          />
        </div>

        <UTable
          :data="orders"
          :columns="columns"
          :loading="status === 'pending'"
          :ui="{
            tr: 'cursor-pointer hover:bg-elevated/50 transition-colors',
            th: 'bg-elevated/30 font-semibold',
            td: 'py-3.5'
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
            <span class="font-medium tabular-nums">
              {{ formatCurrency(row.original.total, row.original.currency) }}
            </span>
          </template>
        </UTable>

        <div
          v-if="meta"
          class="flex flex-wrap items-center justify-between gap-3 border-t border-default px-4 py-3"
        >
          <span class="text-sm text-muted">
            Viser {{ meta.from ?? 0 }}–{{ meta.to ?? 0 }} af {{ meta.total }}
          </span>
          <UPagination
            v-if="meta.last_page > 1"
            v-model:page="page"
            :total="meta.total"
            :items-per-page="meta.per_page"
            size="sm"
          />
        </div>
      </div>

      <CustomOrdersSendDialog
        v-model:open="isModalOpen"
        :order="selectedOrder"
        @sent="refresh"
      />
    </template>
  </UDashboardPanel>
</template>
