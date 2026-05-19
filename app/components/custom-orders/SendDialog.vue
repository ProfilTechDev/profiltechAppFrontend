<script setup lang="ts">
import type { CustomOrder } from '~/composables/useCustomOrders'
import { getSubmissionStatusMeta } from '~/config/submission-status'
import { ORDER_SEND_STEPS, useOrderSendForm } from './useOrderSendForm'

const props = defineProps<{
  open: boolean
  order: CustomOrder | null
}>()

const statusMeta = computed(() =>
  props.order ? getSubmissionStatusMeta(props.order) : null
)

const emit = defineEmits<{
  'update:open': [value: boolean]
  sent: []
}>()

const {
  currentStep,
  lineEdits,
  formState,
  isSubmitting,
  isInitializing,
  isReadOnly,
  selectedProvider,
  includedLines,
  providerItems,
  validateProviderForm,
  canGoNext,
  goNext,
  goPrev,
  handleSend
} = useOrderSendForm({
  order: toRef(props, 'order'),
  open: toRef(props, 'open'),
  onSent: () => emit('sent'),
  onClose: () => emit('update:open', false)
})
</script>

<template>
  <UModal
    :open="open"
    :title="order ? `${isReadOnly ? 'Bestilling' : 'Send bestilling'} #${order.wc_order_id}` : ''"
    :ui="{ content: 'max-w-3xl' }"
    @update:open="emit('update:open', $event)"
  >
    <template #body>
      <div class="space-y-6">
        <div v-if="statusMeta" class="flex justify-end">
          <UBadge
            variant="subtle"
            :color="statusMeta.color"
            :label="statusMeta.label"
          />
        </div>

        <UStepper
          v-if="!isReadOnly"
          :model-value="currentStep"
          :items="ORDER_SEND_STEPS"
          disabled
          class="w-full"
        />

        <div v-if="isInitializing" class="flex justify-center py-12">
          <UIcon name="i-lucide-loader-circle" class="size-6 animate-spin text-muted" />
        </div>

        <template v-else>
          <CustomOrdersStepLines
            v-if="currentStep === 'lines'"
            :lines="lineEdits"
          />

          <CustomOrdersStepProvider
            v-else-if="currentStep === 'provider'"
            :state="formState"
            :provider-items="providerItems"
            :validate="validateProviderForm"
          />

          <CustomOrdersStepSummary
            v-else-if="currentStep === 'summary'"
            :state="formState"
            :provider="selectedProvider"
            :included-lines="includedLines"
          />
        </template>
      </div>
    </template>

    <template #footer>
      <div class="flex w-full justify-between">
        <template v-if="isReadOnly">
          <span />
          <UButton
            label="Luk"
            color="neutral"
            variant="subtle"
            @click="emit('update:open', false)"
          />
        </template>
        <template v-else>
          <UButton
            v-if="currentStep !== 'lines'"
            color="neutral"
            variant="ghost"
            label="Tilbage"
            icon="i-lucide-arrow-left"
            :disabled="isSubmitting || isInitializing"
            @click="goPrev"
          />
          <span v-else />

          <UButton
            v-if="currentStep !== 'summary'"
            label="Gem og fortsæt"
            trailing-icon="i-lucide-arrow-right"
            :disabled="!canGoNext || isInitializing"
            :loading="isSubmitting"
            @click="goNext"
          />
          <UButton
            v-else
            label="Send bestilling"
            icon="i-lucide-send"
            color="primary"
            :disabled="isInitializing"
            :loading="isSubmitting"
            @click="handleSend"
          />
        </template>
      </div>
    </template>
  </UModal>
</template>
