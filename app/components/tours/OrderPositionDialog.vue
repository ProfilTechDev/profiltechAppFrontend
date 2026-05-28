<script setup lang="ts">
import type { FulfillmentOrder } from '~/composables/useFulfillmentOrders'
import type { Tour } from '~/composables/useTours'

export type PositionChoice
  = | { mode: 'end' }
    | { mode: 'gap', primary: number }
    | { mode: 'after', primary: number }

const props = defineProps<{
  order: FulfillmentOrder | null
  tour: Tour | null
}>()

const open = defineModel<boolean>('open', { required: true })

const emit = defineEmits<{
  picked: [PositionChoice]
}>()

/** Map of existing primary slot → max insert_index used at that slot. */
const slotMap = computed(() => {
  const m = new Map<number, number>()
  for (const slot of (props.tour?.orders ?? [])) {
    const current = m.get(slot.primary_sequence) ?? -1
    m.set(slot.primary_sequence, Math.max(current, slot.insert_index))
  }
  return m
})

const orderedPrimaries = computed(() => [...slotMap.value.keys()].sort((a, b) => a - b))

const maxPrimary = computed(() => {
  let max = 0
  for (const p of slotMap.value.keys()) {
    if (p > max) max = p
  }
  return max
})

const nextPrimary = computed(() => maxPrimary.value + 1)

/** Gaps in the 1..maxPrimary range — primary slots that have no rows. */
const gaps = computed(() => {
  const result: number[] = []
  for (let p = 1; p < maxPrimary.value; p++) {
    if (!slotMap.value.has(p)) result.push(p)
  }
  return result
})

function nextLetterFor(primary: number): string {
  const maxIdx = slotMap.value.get(primary) ?? -1
  return String.fromCharCode(65 + maxIdx + 1)
}

function pick(choice: PositionChoice) {
  emit('picked', choice)
  open.value = false
}
</script>

<template>
  <UModal
    v-model:open="open"
    :title="order ? `Hvor skal #${order.wc_order_id} indsættes?` : 'Vælg placering'"
    :ui="{ content: 'max-w-md' }"
  >
    <template #body>
      <div class="space-y-4 text-sm">
        <div>
          <div class="text-xs uppercase tracking-wide text-muted mb-2">
            I slutningen
          </div>
          <UButton
            block
            color="primary"
            variant="soft"
            class="justify-start"
            @click="pick({ mode: 'end' })"
          >
            <UIcon
              name="i-lucide-arrow-down-to-line"
              class="size-4"
            />
            Tilføj som nr. {{ nextPrimary }}
          </UButton>
        </div>

        <div v-if="gaps.length > 0">
          <div class="text-xs uppercase tracking-wide text-muted mb-2">
            Fyld ledig plads
          </div>
          <div class="space-y-2">
            <UButton
              v-for="gap in gaps"
              :key="`gap-${gap}`"
              block
              color="info"
              variant="soft"
              class="justify-start"
              @click="pick({ mode: 'gap', primary: gap })"
            >
              <UIcon
                name="i-lucide-square-dashed"
                class="size-4"
              />
              Indsæt som nr. {{ gap }}
            </UButton>
          </div>
        </div>

        <div v-if="orderedPrimaries.length > 0">
          <div class="text-xs uppercase tracking-wide text-muted mb-2">
            Indsæt mellem to slots (A/B/C)
          </div>
          <div class="space-y-2 max-h-64 overflow-y-auto">
            <UButton
              v-for="p in orderedPrimaries"
              :key="`after-${p}`"
              block
              color="warning"
              variant="soft"
              class="justify-start"
              @click="pick({ mode: 'after', primary: p })"
            >
              <UIcon
                name="i-lucide-corner-down-right"
                class="size-4"
              />
              Indsæt efter nr. {{ p }} → {{ p }}{{ nextLetterFor(p) }}
            </UButton>
          </div>
        </div>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end w-full">
        <UButton
          variant="ghost"
          color="neutral"
          @click="open = false"
        >
          Annullér
        </UButton>
      </div>
    </template>
  </UModal>
</template>
