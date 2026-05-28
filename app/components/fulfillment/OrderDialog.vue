<script setup lang="ts">
import type { FulfillmentOrder } from '~/composables/useFulfillmentOrders'

defineProps<{
  order: FulfillmentOrder | null
}>()

const open = defineModel<boolean>('open', { required: true })

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('da-DK', {
    dateStyle: 'medium',
    timeStyle: 'short'
  })
}

function formatCurrency(amount: string, currency: string) {
  return new Intl.NumberFormat('da-DK', {
    style: 'currency',
    currency
  }).format(Number(amount))
}
</script>

<template>
  <UModal
    v-model:open="open"
    :title="order ? `Ordre #${order.wc_order_id}` : ''"
    :ui="{ content: 'max-w-3xl' }"
  >
    <template #body>
      <div
        v-if="order"
        class="space-y-6"
      >
        <div class="flex flex-wrap items-center gap-2">
          <FulfillmentFlowBadge :flow="order.delivery_flow" />
          <NuxtLink
            v-if="order.tour_assignment"
            :to="`/selvdistribution/${order.tour_assignment.tour_id}`"
            class="inline-flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <UIcon
              name="i-lucide-route"
              class="size-4"
            />
            <span class="font-medium">{{ order.tour_assignment.tour_name }}</span>
            <UBadge
              size="sm"
              variant="subtle"
              color="primary"
            >
              {{ order.tour_assignment.display_sequence }}
            </UBadge>
          </NuxtLink>
        </div>

        <section>
          <h3 class="text-sm font-semibold text-muted mb-2">
            Kunde
          </h3>
          <div class="rounded-lg border border-default p-4 space-y-1 text-sm">
            <div class="font-medium text-default">
              {{ order.customer?.name ?? '—' }}
            </div>
            <div
              v-if="order.customer?.email"
              class="text-muted"
            >
              {{ order.customer.email }}
            </div>
            <div
              v-if="order.customer?.phone"
              class="text-muted"
            >
              {{ order.customer.phone }}
            </div>
          </div>
        </section>

        <section v-if="order.shipping_address">
          <h3 class="text-sm font-semibold text-muted mb-2">
            Leveringsadresse
          </h3>
          <div class="rounded-lg border border-default p-4 text-sm">
            <div class="font-medium text-default">
              {{ order.shipping_address.name }}
            </div>
            <div
              v-if="order.shipping_address.company"
              class="text-muted"
            >
              {{ order.shipping_address.company }}
            </div>
            <div>{{ order.shipping_address.address_1 }}</div>
            <div v-if="order.shipping_address.address_2">
              {{ order.shipping_address.address_2 }}
            </div>
            <div>{{ order.shipping_address.postcode }} {{ order.shipping_address.city }}</div>
            <div class="text-muted">
              {{ order.shipping_address.country }}
            </div>
            <div
              v-if="order.shipping_address.phone"
              class="mt-1 text-muted"
            >
              Tlf: {{ order.shipping_address.phone }}
            </div>
          </div>
        </section>

        <section>
          <h3 class="text-sm font-semibold text-muted mb-2">
            Ordrelinjer ({{ order.lines.length }})
          </h3>
          <ul class="divide-y divide-default rounded-lg border border-default">
            <li
              v-for="line in order.lines"
              :key="line.id"
              class="p-4 flex items-start gap-4"
            >
              <div class="flex-1 space-y-2">
                <div class="flex flex-wrap items-center gap-2">
                  <span class="font-medium text-default">{{ line.name }}</span>
                  <UBadge
                    v-if="line.is_custom"
                    size="sm"
                    variant="soft"
                    color="info"
                  >
                    Custom
                  </UBadge>
                  <FulfillmentDepartmentBadge :department="line.department" />
                </div>
                <CustomOrdersLineAttributes :attributes="line.attributes" />
              </div>
              <div class="text-right text-sm">
                <div class="font-semibold tabular-nums">
                  {{ line.quantity }} stk.
                </div>
              </div>
            </li>
          </ul>
        </section>

        <section class="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <div>
            <div class="text-muted text-xs uppercase tracking-wide">
              Bestilt
            </div>
            <div>{{ formatDate(order.date_created) }}</div>
          </div>
          <div>
            <div class="text-muted text-xs uppercase tracking-wide">
              Betalt
            </div>
            <div>{{ formatDate(order.date_paid) }}</div>
          </div>
          <div>
            <div class="text-muted text-xs uppercase tracking-wide">
              WC-status
            </div>
            <div>{{ order.status }}</div>
          </div>
          <div>
            <div class="text-muted text-xs uppercase tracking-wide">
              Total
            </div>
            <div class="font-semibold tabular-nums">
              {{ formatCurrency(order.total, order.currency) }}
            </div>
          </div>
        </section>

        <section v-if="order.customer_note">
          <h3 class="text-sm font-semibold text-muted mb-2">
            Kundenote
          </h3>
          <div class="rounded-lg border border-default bg-elevated/30 p-4 text-sm whitespace-pre-line">
            {{ order.customer_note }}
          </div>
        </section>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end w-full">
        <UButton
          color="neutral"
          variant="ghost"
          @click="open = false"
        >
          Luk
        </UButton>
      </div>
    </template>
  </UModal>
</template>
