<script setup lang="ts">
import type { FormError, StepperItem } from '@nuxt/ui'
import type { CustomOrder, UpdateLinePayload } from '~/composables/useCustomOrders'
import type { Provider } from '~/composables/useProviders'
import { MESSAGE_TEMPLATES } from '~/config/providers'
import type { LineEdit, ProviderFormState } from './types'

const props = defineProps<{
  open: boolean
  order: CustomOrder | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  sent: []
}>()

const { updateLines, updateProvider, sendOrder, getSubmission } = useCustomOrders()
const { data: providers, refresh: refreshProviders } = useProviders()
const toast = useToast()

const STEPS: StepperItem[] = [
  { value: 'lines', title: 'Linjer', description: 'Bekræft custom produkter', icon: 'i-lucide-list-checks' },
  { value: 'provider', title: 'Modtager', description: 'Vælg provider og besked', icon: 'i-lucide-send' },
  { value: 'summary', title: 'Opsummering', description: 'Gennemse og send', icon: 'i-lucide-check' }
]

const currentStep = ref<string | number>('lines')
const lineEdits = ref<LineEdit[]>([])
const isSubmitting = ref(false)
const isInitializing = ref(false)
const isRestoring = ref(false)

const formState = reactive<ProviderFormState>({
  providerId: '',
  orderNumber: '',
  subject: '',
  message: ''
})

const selectedProvider = computed<Provider | null>(() =>
  providers.value?.find(p => p.id === formState.providerId) ?? null
)

const includedLines = computed(() => lineEdits.value.filter(l => l.included))

const isReadOnly = computed(() => props.order?.submission_status === 'sent')

const providerItems = computed(() =>
  (providers.value ?? []).map(p => ({
    label: `${p.name} (${p.language.toUpperCase()})`,
    description: p.email,
    value: p.id
  }))
)

function applyTemplate(customerName: string) {
  const template = MESSAGE_TEMPLATES[selectedProvider.value?.language ?? 'da']
  formState.subject = template.subject(formState.orderNumber)
  formState.message = template.body(formState.orderNumber, customerName)
}

async function resetState(order: CustomOrder) {
  isInitializing.value = true
  isRestoring.value = true
  try {
    currentStep.value = 'lines'
    lineEdits.value = order.lines.map(l => ({
      id: l.id,
      name: l.name,
      is_custom: l.is_custom,
      has_thickness: l.has_thickness,
      attributes: l.attributes,
      quantity: l.quantity,
      originalQuantity: l.quantity,
      included: l.is_custom,
      thickness: null
    }))
    if (!providers.value?.length) await refreshProviders()
    formState.providerId = providers.value?.[0]?.id ?? ''
    formState.orderNumber = String(order.wc_order_id)
    applyTemplate(order.customer?.name ?? '(ukendt kunde)')

    const submission = await getSubmission(order.id).catch(() => null)
    if (!submission || !props.open || props.order?.id !== order.id) return

    lineEdits.value = order.lines.map((l) => {
      const saved = submission.lines?.find(s => s.id === l.id)
      return {
        id: l.id,
        name: l.name,
        is_custom: l.is_custom,
        has_thickness: l.has_thickness,
        attributes: l.attributes,
        originalQuantity: l.quantity,
        quantity: saved?.quantity ?? l.quantity,
        included: saved?.included ?? l.is_custom,
        thickness: (saved?.thickness as LineEdit['thickness']) ?? null
      }
    })
    formState.providerId = submission.provider_id ?? formState.providerId
    formState.subject = submission.subject ?? formState.subject
    formState.message = submission.message ?? formState.message

    if (order.submission_status === 'sent') currentStep.value = 'summary'
  } finally {
    isInitializing.value = false
    isRestoring.value = false
  }
}

watch(() => props.open, (isOpen) => {
  if (isOpen && props.order) resetState(props.order)
})

watch(() => [formState.providerId, formState.orderNumber], () => {
  if (isRestoring.value) return
  if (props.order) applyTemplate(props.order.customer?.name ?? '(ukendt kunde)')
}, { flush: 'sync' })

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

async function saveProvider() {
  if (!props.order) return
  await updateProvider(props.order.id, {
    provider_id: formState.providerId,
    subject: formState.subject,
    message: formState.message
  })
}

async function goNext() {
  if (isSubmitting.value) return
  isSubmitting.value = true
  try {
    if (currentStep.value === 'lines') {
      await saveLines()
      currentStep.value = 'provider'
    } else if (currentStep.value === 'provider') {
      await saveProvider()
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
      description: `Sendt til ${selectedProvider.value?.name ?? 'provider'}`,
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
      && includedLines.value.every(l => !l.has_thickness || l.thickness !== null)
  }
  if (currentStep.value === 'provider') return validateProviderForm(formState).length === 0
  return true
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
        <UStepper
          v-if="!isReadOnly"
          :model-value="currentStep"
          :items="STEPS"
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
