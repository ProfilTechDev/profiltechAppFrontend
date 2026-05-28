<script setup lang="ts">
import type { FulfillmentOrder } from '~/composables/useFulfillmentOrders'
import type { Tour } from '~/composables/useTours'
import { departmentsFromLines, getDepartmentMeta } from '~/config/department'
import type { PositionChoice } from './OrderPositionDialog.vue'

const props = defineProps<{
  tour: Tour | null
  /** Pre-pick "after this primary slot" — used by per-row "+" buttons so the user skips the picker. */
  initialAfterPrimary?: number | null
}>()

const open = defineModel<boolean>('open', { required: true })

const emit = defineEmits<{
  added: []
}>()

const search = ref('')
const showAllFlows = ref(false)

const apiFlow = computed(() => showAllFlows.value ? '' : 'delivery')

const isApproved = computed(() => props.tour?.status === 'approved')
const hasOrders = computed(() => (props.tour?.orders?.length ?? 0) > 0)

const { orders, status, refresh } = useFulfillmentOrders({
  deliveryFlow: apiFlow,
  onTour: 'no',
  search,
  perPage: 50
})

const { addOrder } = useTourMutations()

watch(open, (value) => {
  if (value) {
    search.value = ''
    showAllFlows.value = false
    refresh()
  }
})

const adding = ref<Set<number>>(new Set())
const toast = useToast()

const positionPickerOpen = ref(false)
const pendingOrder = ref<FulfillmentOrder | null>(null)

/**
 * Click on an order row. Behaviour depends on context:
 *   - Draft tour: add immediately (no position question).
 *   - Approved + initialAfterPrimary set (per-row "+"): use that slot
 *     directly — the user already chose where.
 *   - Approved + no initial: open the position picker.
 */
function handleClick(order: FulfillmentOrder) {
  if (!isApproved.value || !hasOrders.value) {
    add(order, null, null)
    return
  }

  if (props.initialAfterPrimary != null) {
    add(order, props.initialAfterPrimary, null)
    return
  }

  pendingOrder.value = order
  positionPickerOpen.value = true
}

async function add(order: FulfillmentOrder, afterPrimary: number | null, atPrimary: number | null) {
  if (!props.tour) return
  adding.value.add(order.id)
  try {
    await addOrder(props.tour.id, {
      order_id: order.id,
      after_primary: afterPrimary,
      at_primary: atPrimary
    })
    toast.add({ title: 'Ordre tilføjet', color: 'success' })
    emit('added')
    refresh()
  } catch (e) {
    toast.add({
      title: 'Kunne ikke tilføje ordre',
      description: e instanceof Error ? e.message : undefined,
      color: 'error'
    })
  } finally {
    adding.value.delete(order.id)
  }
}

function onPositionPicked(choice: PositionChoice) {
  const order = pendingOrder.value
  pendingOrder.value = null
  if (!order) return

  if (choice.mode === 'end') {
    add(order, null, null)
  } else if (choice.mode === 'gap') {
    add(order, null, choice.primary)
  } else {
    add(order, choice.primary, null)
  }
}
</script>

<template>
  <UModal
    v-model:open="open"
    title="Tilføj ordrer til rute"
    :ui="{ content: 'max-w-2xl' }"
  >
    <template #body>
      <div class="space-y-3">
        <div class="text-sm text-muted">
          <template v-if="isApproved && hasOrders && initialAfterPrimary == null">
            Klik en ordre, så spørger vi hvor den skal sættes ind. Dialogen forbliver åben så du kan tilføje flere ad gangen.
          </template>
          <template v-else>
            Klik en ordre for at tilføje den til ruten. Dialogen forbliver åben så du kan tilføje flere ad gangen.
          </template>
        </div>

        <UInput
          v-model="search"
          placeholder="Søg ordre, kunde, by"
          icon="i-lucide-search"
          class="w-full"
        />

        <label class="flex items-center gap-2 text-sm">
          <USwitch v-model="showAllFlows" />
          <span>Vis alle flow</span>
          <span
            v-if="showAllFlows"
            class="text-xs text-warning"
          >Flow ændres til Levering ved tilføj</span>
        </label>

        <div class="max-h-96 overflow-y-auto rounded border border-default divide-y divide-default">
          <button
            v-for="order in orders"
            :key="order.id"
            type="button"
            class="w-full p-3 text-left hover:bg-elevated/50 disabled:opacity-50 transition-colors"
            :disabled="adding.has(order.id)"
            @click="handleClick(order)"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0 flex-1">
                <div class="font-medium">
                  #{{ order.wc_order_id }} · {{ order.customer?.name ?? '—' }}
                </div>
                <div class="text-sm text-muted">
                  {{ order.shipping_address?.postcode }} {{ order.shipping_address?.city }}
                </div>
                <div class="mt-1 flex flex-wrap items-center gap-1">
                  <FulfillmentFlowBadge
                    v-if="order.delivery_flow !== 'delivery'"
                    :flow="order.delivery_flow"
                  />
                  <UBadge
                    v-for="dept in departmentsFromLines(order.lines)"
                    :key="dept"
                    :color="getDepartmentMeta(dept).color"
                    variant="subtle"
                    size="sm"
                  >
                    {{ getDepartmentMeta(dept).label }}
                  </UBadge>
                </div>
              </div>
              <UIcon
                v-if="adding.has(order.id)"
                name="i-lucide-loader-circle"
                class="mt-1 size-4 animate-spin text-muted"
              />
              <UIcon
                v-else
                name="i-lucide-plus"
                class="mt-1 size-4 text-muted"
              />
            </div>
          </button>

          <div
            v-if="status === 'pending'"
            class="p-4 text-center text-muted text-sm"
          >
            Indlæser…
          </div>
          <div
            v-else-if="orders.length === 0"
            class="p-4 text-center text-muted text-sm"
          >
            <template v-if="showAllFlows">
              Ingen ledige ordrer.
            </template>
            <template v-else>
              Ingen ledige Levering-ordrer. Slå "Vis alle flow" til for at se andre flows.
            </template>
          </div>
        </div>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end gap-2 w-full">
        <UButton
          color="primary"
          @click="open = false"
        >
          Færdig
        </UButton>
      </div>
    </template>
  </UModal>

  <ToursOrderPositionDialog
    v-model:open="positionPickerOpen"
    :order="pendingOrder"
    :tour="tour"
    @picked="onPositionPicked"
  />
</template>
