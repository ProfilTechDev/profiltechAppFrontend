<script setup lang="ts">
import type { FormError, StepperItem } from '@nuxt/ui'
import type { CustomOrder, UpdateLinePayload } from '~/composables/useCustomOrders'
import { MESSAGE_TEMPLATES, PROVIDERS, type Provider } from '~/config/providers'
import type { LineEdit, ProviderFormState } from './types'

const props = defineProps<{
  open: boolean
  order: CustomOrder | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  sent: []
}>()

const { updateLines, sendOrder } = useCustomOrders()
const toast = useToast()

const STEPS: StepperItem[] = [
  { value: 'lines', title: 'Linjer', description: 'Bekræft custom produkter', icon: 'i-lucide-list-checks' },
  { value: 'provider', title: 'Modtager', description: 'Vælg provider og besked', icon: 'i-lucide-send' },
  { value: 'summary', title: 'Opsummering', description: 'Gennemse og send', icon: 'i-lucide-check' }
]

const currentStep = ref<string | number>('lines')
const lineEdits = ref<LineEdit[]>([])
const isSubmitting = ref(false)

const formState = reactive<ProviderFormState>({
  providerId: PROVIDERS[0]!.id,
  orderNumber: '',
  subject: '',
  message: ''
})

const selectedProvider = computed<Provider>(() =>
  PROVIDERS.find(p => p.id === formState.providerId) ?? PROVIDERS[0]!
)

const includedLines = computed(() => lineEdits.value.filter(l => l.included))

const providerItems = computed(() =>
  PROVIDERS.map(p => ({
    label: `${p.name} (${p.language.toUpperCase()})`,
    description: p.email,
    value: p.id
  }))
)

function applyTemplate(customerName: string) {
  const template = MESSAGE_TEMPLATES[selectedProvider.value.language]
  formState.subject = template.subject(formState.orderNumber)
  formState.message = template.body(formState.orderNumber, customerName)
}

function resetState(order: CustomOrder) {
  currentStep.value = 'lines'
  lineEdits.value = order.lines.map(l => ({
    id: l.id,
    name: l.name,
    is_custom: l.is_custom,
    quantity: l.quantity,
    originalQuantity: l.quantity,
    included: l.is_custom,
    thickness: null
  }))
  formState.providerId = PROVIDERS[0]!.id
  formState.orderNumber = String(order.wc_order_id)
  applyTemplate(order.customer_name)
}

watch(() => props.open, (isOpen) => {
  if (isOpen && props.order) resetState(props.order)
})

watch(() => [formState.providerId, formState.orderNumber], () => {
  if (props.order) applyTemplate(props.order.customer_name)
})

function validateProviderForm(state: ProviderFormState): FormError[] {
  const errors: FormError[] = []
  if (!state.providerId) errors.push({ name: 'providerId', message: 'Vælg en provider' })
  if (!state.orderNumber.trim()) errors.push({ name: 'orderNumber', message: 'Ordrenummer kræves' })
  if (!state.subject.trim()) errors.push({ name: 'subject', message: 'Emne kræves' })
  return errors
}

async function saveLines() {
  if (!props.order) return
  const payload: UpdateLinePayload[] = lineEdits.value.map(l => ({
    id: l.id,
    quantity: l.quantity,
    included: l.included,
    thickness: l.included ? l.thickness : null
  }))
  await updateLines(props.order.id, payload)
}

async function goNext() {
  if (isSubmitting.value) return
  isSubmitting.value = true
  try {
    if (currentStep.value === 'lines') {
      await saveLines()
      currentStep.value = 'provider'
    } else if (currentStep.value === 'provider') {
      currentStep.value = 'summary'
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Ukendt fejl'
    toast.add({
      title: 'Kunne ikke gemme ændringer',
      description: message,
      color: 'error',
      icon: 'i-lucide-triangle-alert'
    })
  } finally {
    isSubmitting.value = false
  }
}

function goPrev() {
  if (currentStep.value === 'summary') currentStep.value = 'provider'
  else if (currentStep.value === 'provider') currentStep.value = 'lines'
}

async function handleSend() {
  if (!props.order) return
  isSubmitting.value = true
  try {
    await sendOrder(props.order.id, {
      provider_id: formState.providerId,
      subject: formState.subject,
      message: formState.message
    })
    toast.add({
      title: 'Bestilling sendt',
      description: `Sendt til ${selectedProvider.value.name}`,
      color: 'success',
      icon: 'i-lucide-circle-check'
    })
    emit('sent')
    emit('update:open', false)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Ukendt fejl'
    toast.add({
      title: 'Kunne ikke sende bestilling',
      description: message,
      color: 'error',
      icon: 'i-lucide-triangle-alert'
    })
  } finally {
    isSubmitting.value = false
  }
}

const canGoNext = computed(() => {
  if (currentStep.value === 'lines') {
    return includedLines.value.length > 0
      && includedLines.value.every(l => l.thickness !== null)
  }
  if (currentStep.value === 'provider') return validateProviderForm(formState).length === 0
  return true
})
</script>

<template>
  <UModal
    :open="open"
    :title="order ? `Send bestilling #${order.wc_order_id}` : ''"
    :ui="{ content: 'max-w-3xl' }"
    @update:open="emit('update:open', $event)"
  >
    <template #body>
      <div class="space-y-6">
        <UStepper
          :model-value="currentStep"
          :items="STEPS"
          disabled
          class="w-full"
        />

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
      </div>
    </template>

    <template #footer>
      <div class="flex w-full justify-between">
        <UButton
          v-if="currentStep !== 'lines'"
          color="neutral"
          variant="ghost"
          label="Tilbage"
          icon="i-lucide-arrow-left"
          :disabled="isSubmitting"
          @click="goPrev"
        />
        <span v-else />

        <UButton
          v-if="currentStep !== 'summary'"
          label="Gem og fortsæt"
          trailing-icon="i-lucide-arrow-right"
          :disabled="!canGoNext"
          :loading="isSubmitting"
          @click="goNext"
        />
        <UButton
          v-else
          label="Send bestilling"
          icon="i-lucide-send"
          color="primary"
          :loading="isSubmitting"
          @click="handleSend"
        />
      </div>
    </template>
  </UModal>
</template>
