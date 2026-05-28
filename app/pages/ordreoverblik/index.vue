<script setup lang="ts">
import type { DropdownMenuItem, TableColumn, TableRow } from '@nuxt/ui'
import type { FulfillmentOrder } from '~/composables/useFulfillmentOrders'
import type { DeliveryFlow } from '~/config/delivery-flow'
import { type Department, DEPARTMENTS, departmentsFromLines, getDepartmentMeta } from '~/config/department'
import { allowedPackingStatusesFor, getPackingStatusMeta, type PackingStatus } from '~/config/packing-status'
import { TABLE_UI } from '~/config/table-ui'

type FlowFilter = 'all' | 'none' | DeliveryFlow
type DepartmentFilter = 'all' | Department

const page = ref(1)
const perPage = ref(20)
const search = ref('')
const flowFilter = ref<FlowFilter>('all')
const departmentFilter = ref<DepartmentFilter>('all')
const onTour = ref<'all' | 'yes' | 'no'>('all')

const { orders, meta, status, refresh, setFlow, setPackingStatus } = useFulfillmentOrders({
  page,
  perPage,
  deliveryFlow: useAllSentinel(flowFilter),
  department: useAllSentinel(departmentFilter),
  onTour: useAllSentinel(onTour),
  search
})

useFulfillmentChannel(() => refresh())

watch([flowFilter, departmentFilter, onTour, search, perPage], () => {
  page.value = 1
})

const flowOptions: { label: string, value: FlowFilter }[] = [
  { label: 'Alle flow', value: 'all' },
  { label: 'Ikke tildelt', value: 'none' },
  { label: 'Levering', value: 'delivery' },
  { label: 'Sende', value: 'shipping' },
  { label: 'Afhentning', value: 'pickup' }
]

const departmentOptions = computed<{ label: string, value: DepartmentFilter }[]>(() => [
  { label: 'Alle afdelinger', value: 'all' },
  ...DEPARTMENTS.map(dept => ({
    label: getDepartmentMeta(dept).label,
    value: dept
  }))
])

const onTourOptions = [
  { label: 'Alle ruter', value: 'all' },
  { label: 'På rute', value: 'yes' },
  { label: 'Ikke på rute', value: 'no' }
]

const columns: TableColumn<FulfillmentOrder>[] = [
  { accessorKey: 'wc_order_id', header: 'Ordre #' },
  { accessorKey: 'customer', header: 'Kunde / by' },
  { accessorKey: 'lines', header: 'Afdelinger' },
  { accessorKey: 'delivery_flow', header: 'Flow' },
  { accessorKey: 'packing_status', header: 'Status' },
  { accessorKey: 'actions', header: '' }
]

const { run: runSetFlow } = useToastAction(setFlow, {
  errorTitle: 'Kunne ikke ændre flow'
})

const { run: runSetStatus } = useToastAction(setPackingStatus, {
  errorTitle: 'Kunne ikke ændre status'
})

const detailOpen = ref(false)
const detailOrder = ref<FulfillmentOrder | null>(null)

const addToTourOpen = ref(false)
const addToTourOrder = ref<FulfillmentOrder | null>(null)

function openDetail(_e: Event, row: TableRow<FulfillmentOrder>) {
  detailOrder.value = row.original
  detailOpen.value = true
}

function openAddToTour(order: FulfillmentOrder) {
  addToTourOrder.value = order
  addToTourOpen.value = true
}

function changeFlow(order: FulfillmentOrder, flow: DeliveryFlow | null) {
  runSetFlow(order.id, flow)
}

function changeStatus(order: FulfillmentOrder, status: PackingStatus) {
  runSetStatus(order.id, status)
}

function rowMenu(order: FulfillmentOrder): DropdownMenuItem[][] {
  const groups: DropdownMenuItem[][] = []

  if (order.delivery_flow === 'delivery' && !order.tour_assignment) {
    groups.push([{
      label: 'Tilføj til rute',
      icon: 'i-lucide-route',
      onSelect: () => openAddToTour(order)
    }])
  }

  const statusItems: DropdownMenuItem[] = allowedPackingStatusesFor(order.delivery_flow, !!order.tour_assignment)
    .filter(s => s !== order.packing_status)
    .map((s) => {
      const meta = getPackingStatusMeta(s)!
      return {
        label: meta.label,
        icon: meta.icon,
        onSelect: () => changeStatus(order, s)
      }
    })

  if (statusItems.length > 0) {
    groups.push([
      { label: 'Ændre status', type: 'label' as const },
      ...statusItems
    ])
  }

  return groups
}
</script>

<template>
  <UDashboardPanel id="ordreoverblik">
    <template #header>
      <UDashboardNavbar title="Ordreoverblik">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="rounded-lg border border-default bg-default shadow-xs">
        <AppFilterBar
          v-model:search="search"
          search-placeholder="Søg ordre, kunde, by"
        >
          <USelect
            v-model="flowFilter"
            :items="flowOptions"
            value-key="value"
            icon="i-lucide-truck"
            size="lg"
            class="w-48"
          />
          <USelect
            v-model="departmentFilter"
            :items="departmentOptions"
            value-key="value"
            icon="i-lucide-layers"
            size="lg"
            class="w-48"
          />
          <USelect
            v-model="onTour"
            :items="onTourOptions"
            value-key="value"
            icon="i-lucide-route"
            size="lg"
            class="w-48"
          />
        </AppFilterBar>

        <UTable
          :data="orders"
          :columns="columns"
          :loading="status === 'pending'"
          class="min-h-[300px]"
          :ui="TABLE_UI"
          @select="openDetail"
        >
          <template #wc_order_id-cell="{ row }">
            <div class="font-semibold">
              #{{ row.original.wc_order_id }}
            </div>
            <div
              v-if="row.original.wc_number"
              class="text-xs text-muted"
            >
              {{ row.original.wc_number }}
            </div>
          </template>

          <template #customer-cell="{ row }">
            <div>{{ row.original.customer?.name ?? '—' }}</div>
            <div class="text-xs text-muted">
              {{ row.original.shipping_address?.city ?? '' }}
            </div>
          </template>

          <template #lines-cell="{ row }">
            <div class="flex flex-wrap gap-1">
              <FulfillmentDepartmentBadge
                v-for="dept in departmentsFromLines(row.original.lines)"
                :key="dept"
                :department="dept"
              />
            </div>
          </template>

          <template #delivery_flow-cell="{ row }">
            <div @click.stop>
              <FulfillmentFlowSelector
                :model-value="row.original.delivery_flow"
                @update:model-value="changeFlow(row.original, $event)"
              />
            </div>
          </template>

          <template #packing_status-cell="{ row }">
            <FulfillmentPackingStatusBadge :status="row.original.packing_status" />
          </template>

          <template #actions-cell="{ row }">
            <div
              class="flex justify-end"
              @click.stop
            >
              <UDropdownMenu
                v-if="rowMenu(row.original).length > 0"
                :items="rowMenu(row.original)"
                :content="{ align: 'end' }"
              >
                <UButton
                  icon="i-lucide-more-horizontal"
                  color="neutral"
                  variant="ghost"
                  size="sm"
                />
              </UDropdownMenu>
            </div>
          </template>
        </UTable>

        <AppPaginationFooter
          v-model:page="page"
          v-model:per-page="perPage"
          :meta="meta"
        />
      </div>

      <FulfillmentOrderDialog
        v-model:open="detailOpen"
        :order="detailOrder"
      />

      <FulfillmentAddToTourDialog
        v-model:open="addToTourOpen"
        :order="addToTourOrder"
        @added="refresh()"
      />
    </template>
  </UDashboardPanel>
</template>
