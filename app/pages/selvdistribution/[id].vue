<script setup lang="ts">
import { departmentsFromLines, getDepartmentMeta } from '~/config/department'
import { getTourStatusMeta } from '~/config/tour-status'

const route = useRoute()
const router = useRouter()
const tourId = computed(() => Number(route.params.id))

const { tour, status, refresh, removeOrder, reorder, approve, complete } = useTour(tourId)

useTourChannel(tourId, () => refresh())

const isDraft = computed(() => tour.value?.status === 'draft')
const isApproved = computed(() => tour.value?.status === 'approved')
const isCompleted = computed(() => tour.value?.status === 'completed')

const { loading: approving, run: runApprove } = useToastAction(approve, {
  successTitle: 'Rute godkendt',
  errorTitle: 'Kunne ikke godkende'
})
const { loading: completing, run: runComplete } = useToastAction(complete, {
  successTitle: 'Rute færdig',
  errorTitle: 'Kunne ikke afslutte'
})
const { loading: removing, run: runRemoveOrder } = useToastAction(removeOrder, {
  errorTitle: 'Kunne ikke fjerne'
})
const { loading: reordering, run: runReorder } = useToastAction(reorder, {
  errorTitle: 'Kunne ikke ændre rækkefølge'
})

const acting = computed(() =>
  approving.value || completing.value || removing.value || reordering.value
)

async function doApprove() {
  if ((await runApprove()) !== undefined) refresh()
}

async function doComplete() {
  if ((await runComplete()) !== undefined) refresh()
}

async function doRemove(orderId: number) {
  if (!confirm('Fjern ordren fra ruten? Rute-nummeret efterlades som hul.')) return
  if ((await runRemoveOrder(orderId)) !== undefined) refresh()
}

async function move(index: number, direction: -1 | 1) {
  if (!tour.value?.orders) return
  const target = index + direction
  if (target < 0 || target >= tour.value.orders.length) return
  const ids = tour.value.orders.map(o => o.order!.id)
  ;[ids[index], ids[target]] = [ids[target]!, ids[index]!]
  if ((await runReorder(ids)) !== undefined) refresh()
}

const addDialogInitialAfter = ref<number | null>(null)
const showAddDialog = ref(false)

function openAdd(initialAfter: number | null = null) {
  addDialogInitialAfter.value = initialAfter
  showAddDialog.value = true
}

function formatDate(iso: string | null) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('da-DK', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
}
</script>

<template>
  <UDashboardPanel id="selvdistribution-detail">
    <template #header>
      <UDashboardNavbar :title="tour?.name ?? 'Rute'">
        <template #leading>
          <UButton
            icon="i-lucide-arrow-left"
            variant="ghost"
            color="neutral"
            @click="router.push('/selvdistribution')"
          />
        </template>
        <template #right>
          <div
            v-if="tour"
            class="flex items-center gap-2"
          >
            <UBadge
              :color="getTourStatusMeta(tour.status).color"
              variant="subtle"
            >
              {{ getTourStatusMeta(tour.status).label }}
            </UBadge>
            <UButton
              v-if="!isCompleted"
              icon="i-lucide-plus"
              variant="outline"
              @click="openAdd()"
            >
              Tilføj ordre
            </UButton>
            <UButton
              v-if="isDraft"
              icon="i-lucide-circle-check"
              color="success"
              :loading="approving"
              :disabled="(tour.orders?.length ?? 0) === 0"
              @click="doApprove"
            >
              Godkend rute
            </UButton>
            <UButton
              v-if="isApproved"
              icon="i-lucide-flag"
              color="primary"
              :loading="completing"
              @click="doComplete"
            >
              Afslut rute
            </UButton>
          </div>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div
        v-if="status === 'pending' && !tour"
        class="text-muted"
      >
        Indlæser rute…
      </div>

      <div
        v-else-if="tour"
        class="space-y-4"
      >
        <div class="rounded-lg border border-default bg-default p-4 shadow-xs">
          <div class="flex items-baseline justify-between gap-3">
            <div>
              <div class="text-sm text-muted">
                {{ formatDate(tour.tour_date) }}
              </div>
              <h2 class="text-lg font-semibold">
                {{ tour.name }}
              </h2>
            </div>
            <div class="text-sm text-muted">
              {{ tour.orders_count }} ordrer
            </div>
          </div>
          <p
            v-if="tour.notes"
            class="mt-3 text-sm text-default whitespace-pre-line"
          >
            {{ tour.notes }}
          </p>
        </div>

        <div class="rounded-lg border border-default bg-default shadow-xs">
          <div class="border-b border-default p-3 bg-elevated/30 text-sm text-muted">
            <template v-if="isDraft">
              Træk i pilene for at flytte ordren. Først ved godkendelse låses rækkefølgen.
            </template>
            <template v-else-if="isApproved">
              Rute-nummeret er låst. Indsæt nye ordrer mellem to slots — de får automatisk A/B/C suffiks.
            </template>
            <template v-else>
              Ruten er afsluttet.
            </template>
          </div>

          <ul class="divide-y divide-default">
            <li
              v-for="(slot, index) in tour.orders ?? []"
              :key="`${slot.primary_sequence}-${slot.insert_index}`"
              class="flex items-center gap-4 p-3"
            >
              <div class="w-16 text-center">
                <div class="text-xl font-bold tabular-nums">
                  {{ slot.display_sequence }}
                </div>
                <div
                  v-if="slot.added_after_approval"
                  class="text-[10px] uppercase text-warning"
                >
                  Indsat
                </div>
              </div>

              <div class="flex-1 min-w-0">
                <div class="font-medium">
                  #{{ slot.order?.wc_order_id }} · {{ slot.order?.customer?.name ?? '—' }}
                </div>
                <div class="text-sm text-muted">
                  {{ slot.order?.shipping_address?.address_1 ?? '' }},
                  {{ slot.order?.shipping_address?.postcode ?? '' }}
                  {{ slot.order?.shipping_address?.city ?? '' }}
                </div>
                <div class="mt-1 flex flex-wrap gap-1">
                  <UBadge
                    v-for="dept in departmentsFromLines(slot.order?.lines ?? [])"
                    :key="dept"
                    :color="getDepartmentMeta(dept).color"
                    variant="subtle"
                    size="sm"
                  >
                    {{ getDepartmentMeta(dept).label }}
                  </UBadge>
                </div>
              </div>

              <div class="flex items-center gap-1">
                <template v-if="isDraft">
                  <UButton
                    icon="i-lucide-arrow-up"
                    size="xs"
                    variant="ghost"
                    :disabled="acting || index === 0"
                    @click="move(index, -1)"
                  />
                  <UButton
                    icon="i-lucide-arrow-down"
                    size="xs"
                    variant="ghost"
                    :disabled="acting || index === (tour.orders?.length ?? 0) - 1"
                    @click="move(index, 1)"
                  />
                </template>
                <UButton
                  v-if="isApproved"
                  icon="i-lucide-plus"
                  size="xs"
                  variant="ghost"
                  title="Indsæt ordre efter denne"
                  @click="openAdd(slot.primary_sequence)"
                />
                <UButton
                  v-if="!isCompleted"
                  icon="i-lucide-trash-2"
                  size="xs"
                  variant="ghost"
                  color="error"
                  :disabled="acting"
                  @click="doRemove(slot.order!.id)"
                />
              </div>
            </li>

            <li
              v-if="(tour.orders?.length ?? 0) === 0"
              class="p-6 text-center"
            >
              <div class="text-muted mb-3">
                Ingen ordrer på ruten endnu.
              </div>
              <UButton
                v-if="!isCompleted"
                icon="i-lucide-plus"
                color="primary"
                @click="openAdd()"
              >
                Tilføj ordre
              </UButton>
            </li>
          </ul>
        </div>
      </div>

      <ToursAddOrdersDialog
        v-model:open="showAddDialog"
        :tour="tour ?? null"
        :initial-after-primary="addDialogInitialAfter"
        @added="refresh()"
      />
    </template>
  </UDashboardPanel>
</template>
