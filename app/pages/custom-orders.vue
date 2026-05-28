<script setup lang="ts">
import type { TableColumn, TableRow } from '@nuxt/ui'
import type { CustomOrder } from '~/composables/useCustomOrders'
import { getSubmissionStatusMeta } from '~/config/submission-status'
import { TABLE_UI } from '~/config/table-ui'

const page = ref(1)
const perPage = ref(20)
const orderStatusFilter = ref('all')
const submissionStatusFilter = ref('all')
const search = ref('')

const { orders, meta, status, refresh, markReceived } = useCustomOrders({
  page,
  perPage,
  orderStatus: useAllSentinel(orderStatusFilter),
  submissionStatus: useAllSentinel(submissionStatusFilter),
  search
})

const { run: receiveOrder } = useToastAction(markReceived, {
  successTitle: 'Markeret som modtaget',
  errorTitle: 'Kunne ikke markere som modtaget'
})

const receiving = ref(new Set<number>())

async function markOrderReceived(event: Event, orderId: number) {
  event.stopPropagation()
  if (!confirm('Marker bestillingen som modtaget fra leverandøren? Ordren bliver klar til pakning.')) return
  receiving.value.add(orderId)
  try {
    const result = await receiveOrder(orderId)
    if (result !== undefined) refresh()
  } finally {
    receiving.value.delete(orderId)
  }
}

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
        <AppFilterBar
          v-model:search="search"
          search-placeholder="Søg på ordre, kunde eller email"
        >
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
        </AppFilterBar>

        <UTable
          :data="orders"
          :columns="columns"
          :loading="status === 'pending'"
          :ui="TABLE_UI"
          @select="onSelect"
        >
          <template #customer-cell="{ row }">
            {{ row.original.customer?.name ?? '(ukendt kunde)' }}
          </template>

          <template #submission_status-cell="{ row }">
            <div class="flex items-center gap-2">
              <UBadge
                variant="subtle"
                :color="getSubmissionStatusMeta(row.original).color"
                :label="getSubmissionStatusMeta(row.original).label"
              />
              <UButton
                v-if="row.original.submission_status === 'sent' && !row.original.submission_received_at"
                size="xs"
                variant="outline"
                color="success"
                icon="i-lucide-package-check"
                :loading="receiving.has(row.original.id)"
                @click="markOrderReceived($event, row.original.id)"
              >
                Modtaget
              </UButton>
              <UBadge
                v-else-if="row.original.submission_received_at"
                size="xs"
                variant="soft"
                color="success"
                icon="i-lucide-package-check"
                label="Modtaget"
              />
            </div>
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

        <AppPaginationFooter
          v-model:page="page"
          v-model:per-page="perPage"
          :meta="meta"
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
