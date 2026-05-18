import type { FormError, StepperItem } from '@nuxt/ui'
import type { Ref } from 'vue'
import type { CustomOrder, UpdateLinePayload } from '~/composables/useCustomOrders'
import type { Provider } from '~/composables/useProviders'
import { MESSAGE_TEMPLATES } from '~/config/providers'
import type { LineEdit, ProviderFormState } from './types'

export const ORDER_SEND_STEPS: StepperItem[] = [
  { value: 'lines', title: 'Linjer', description: 'Bekræft custom produkter', icon: 'i-lucide-list-checks' },
  { value: 'provider', title: 'Modtager', description: 'Vælg provider og besked', icon: 'i-lucide-send' },
  { value: 'summary', title: 'Opsummering', description: 'Gennemse og send', icon: 'i-lucide-check' }
]

interface UseOrderSendFormOptions {
  order: Ref<CustomOrder | null>
  open: Ref<boolean>
  onSent: () => void
  onClose: () => void
}

export function useOrderSendForm({ order, open, onSent, onClose }: UseOrderSendFormOptions) {
  const { updateLines, updateProvider, sendOrder, getSubmission } = useCustomOrders()
  const { data: providers, refresh: refreshProviders } = useProviders()
  const toast = useToast()

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

  const isReadOnly = computed(() => order.value?.submission_status === 'sent')

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

  async function resetState(currentOrder: CustomOrder) {
    isInitializing.value = true
    isRestoring.value = true
    try {
      currentStep.value = 'lines'
      lineEdits.value = currentOrder.lines.map(l => ({
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
      formState.orderNumber = String(currentOrder.wc_order_id)
      applyTemplate(currentOrder.customer?.name ?? '(ukendt kunde)')

      const submission = await getSubmission(currentOrder.id).catch(() => null)
      if (!submission || !open.value || order.value?.id !== currentOrder.id) return

      lineEdits.value = currentOrder.lines.map((l) => {
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

      if (currentOrder.submission_status === 'sent') currentStep.value = 'summary'
    } finally {
      isInitializing.value = false
      isRestoring.value = false
    }
  }

  watch(open, (isOpen) => {
    if (isOpen && order.value) resetState(order.value)
  })

  watch(() => [formState.providerId, formState.orderNumber], () => {
    if (isRestoring.value) return
    if (order.value) applyTemplate(order.value.customer?.name ?? '(ukendt kunde)')
  }, { flush: 'sync' })

  function validateProviderForm(state: ProviderFormState): FormError[] {
    const errors: FormError[] = []
    if (!state.providerId) errors.push({ name: 'providerId', message: 'Vælg en provider' })
    if (!state.orderNumber.trim()) errors.push({ name: 'orderNumber', message: 'Ordrenummer kræves' })
    if (!state.subject.trim()) errors.push({ name: 'subject', message: 'Emne kræves' })
    return errors
  }

  async function saveLines() {
    if (!order.value) return
    const payload: UpdateLinePayload[] = lineEdits.value.map(l => ({
      id: l.id,
      quantity: l.quantity,
      included: l.included,
      thickness: l.included ? l.thickness : null
    }))
    await updateLines(order.value.id, payload)
  }

  async function saveProvider() {
    if (!order.value) return
    await updateProvider(order.value.id, {
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
    if (!order.value) return
    isSubmitting.value = true
    try {
      await sendOrder(order.value.id, {
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
      onSent()
      onClose()
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

  return {
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
  }
}
