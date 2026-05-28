<script setup lang="ts">
import type { FulfillmentOrder } from '~/composables/useFulfillmentOrders'

const props = defineProps<{
  order: FulfillmentOrder | null
}>()

const open = defineModel<boolean>('open', { required: true })

const emit = defineEmits<{
  added: []
}>()

const { tours, refresh: refreshTours } = useTours({ status: 'draft,approved', perPage: 50 })

const selectedTourId = ref<number | undefined>(undefined)
const afterPrimary = ref<number | undefined>(undefined)
const showCreate = ref(false)
const saving = ref(false)
const toast = useToast()
const { addOrder } = useTourMutations()

const tourOptions = computed(() =>
  tours.value.map(t => ({
    value: t.id,
    label: `${t.name} (${new Date(t.tour_date).toLocaleDateString('da-DK')}) — ${t.status}`
  }))
)

const selectedTour = computed(() => tours.value.find(t => t.id === selectedTourId.value) ?? null)
const isApproved = computed(() => selectedTour.value?.status === 'approved')

watch(open, (value) => {
  if (value) {
    selectedTourId.value = undefined
    afterPrimary.value = undefined
  }
})

async function submit() {
  if (!props.order || !selectedTourId.value) return
  saving.value = true
  try {
    await addOrder(selectedTourId.value, {
      order_id: props.order.id,
      after_primary: isApproved.value ? (afterPrimary.value ?? null) : null
    })
    toast.add({ title: 'Ordre tilføjet til rute', color: 'success' })
    emit('added')
    open.value = false
  } catch (e) {
    toast.add({
      title: 'Kunne ikke tilføje ordre',
      description: e instanceof Error ? e.message : undefined,
      color: 'error'
    })
  } finally {
    saving.value = false
  }
}

function onTourCreated(id: number) {
  refreshTours().then(() => {
    selectedTourId.value = id
  })
}
</script>

<template>
  <UModal
    v-model:open="open"
    title="Tilføj til rute"
  >
    <template #body>
      <div class="space-y-4">
        <div
          v-if="order"
          class="rounded border border-default p-3 text-sm bg-elevated/30"
        >
          <div class="font-semibold">
            Ordre #{{ order.wc_order_id }}
          </div>
          <div class="text-muted">
            {{ order.customer?.name ?? '—' }} · {{ order.shipping_address?.city ?? '—' }}
          </div>
        </div>

        <UFormField label="Vælg rute">
          <div class="flex gap-2">
            <USelect
              v-model="selectedTourId"
              :items="tourOptions"
              value-key="value"
              placeholder="Vælg eksisterende rute"
              class="flex-1"
            />
            <UButton
              icon="i-lucide-plus"
              variant="outline"
              @click="showCreate = true"
            >
              Ny
            </UButton>
          </div>
        </UFormField>

        <UFormField
          v-if="isApproved"
          label="Indsæt efter rute-nr."
          help="Ruten er godkendt — angiv det primære nummer den nye ordre skal sidde efter. Den får automatisk A/B/C suffiks."
        >
          <UInput
            v-model.number="afterPrimary"
            type="number"
            min="1"
            placeholder="f.eks. 2 → 2A"
            class="w-full"
          />
        </UFormField>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end gap-2 w-full">
        <UButton
          variant="ghost"
          color="neutral"
          @click="open = false"
        >
          Annullér
        </UButton>
        <UButton
          :loading="saving"
          :disabled="!selectedTourId"
          color="primary"
          @click="submit"
        >
          Tilføj
        </UButton>
      </div>
    </template>

    <ToursTourCreateDialog
      v-model:open="showCreate"
      @created="onTourCreated"
    />
  </UModal>
</template>
