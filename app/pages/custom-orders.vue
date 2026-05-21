<script setup lang="ts">
import type { TableColumn, TableRow } from '@nuxt/ui'
import type { CustomOrder } from '~/composables/useCustomOrders'
import { getSubmissionStatusMeta } from '~/config/submission-status'

const page = ref(1)
const perPage = ref(20)
const orderStatusFilter = ref('all')
const submissionStatusFilter = ref('all')
const search = ref('')

const apiOrderStatus = computed(() => orderStatusFilter.value === 'all' ? '' : orderStatusFilter.value)
const apiSubmissionStatus = computed(() => submissionStatusFilter.value === 'all' ? '' : submissionStatusFilter.value)

const { orders, meta, status, refresh } = useCustomOrders({
  page,
  perPage,
  orderStatus: apiOrderStatus,
  submissionStatus: apiSubmissionStatus,
  search
})

const orderStatusOptions = [
  { label: 'Alle ordrer', value: 'all' },
  { label: 'Aktive', value: 'active' },
  { label: 'Gennemført', value: 'completed' }
]

const submissionStatusOptions = [
  { label: 'Alle afsendelser', value: 'all' },
  { label: 'Ikke sendt', value: 'unsent' },
  { label: 'Sendt', value: 'sent' }
]

const perPageOptions = [
  { label: '10', value: 10 },
  { label: '20', value: 20 },
  { label: '50', value: 50 },
  { label: '100', value: 100 }
]

const pendingOrderIds = computed(() =>
  orders.value
    .filter(o => o.submission_status === 'queued' || o.submission_status === 'draft')
    .map(o => o.id)
)

useSubmissionChannels(pendingOrderIds, () => {
  refresh()
})

watch([orderStatusFilter, submissionStatusFilter, search, perPage], () => {
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
      <div class="rounded-lg border border-default bg-default shadow-xs">
        <div class="flex flex-wrap items-center justify-between gap-3 border-b border-default bg-elevated/30 p-4">
          <UInput
            v-model="search"
            placeholder="Søg på ordre, kunde eller email"
            icon="i-lucide-search"
            size="lg"
            class="min-w-60 w-full max-w-80"
          />
          <div class="flex flex-wrap items-center gap-3">
            <USelect
              v-model="orderStatusFilter"
              :items="orderStatusOptions"
              icon="i-lucide-package"
              size="lg"
              class="w-48"
            />
            <USelect
              v-model="submissionStatusFilter"
              :items="submissionStatusOptions"
              icon="i-lucide-send"
              size="lg"
              class="w-48"
            />
          </div>
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
              :color="getSubmissionStatusMeta(row.original).color"
              :label="getSubmissionStatusMeta(row.original).label"
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
          <span v-else class="hidden sm:block" />
          <div class="flex items-center gap-2 sm:justify-self-end">
            <span class="text-sm text-muted">Pr. side</span>
            <USelect
              v-model="perPage"
              :items="perPageOptions"
              size="sm"
              class="w-20"
            />
          </div>
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
