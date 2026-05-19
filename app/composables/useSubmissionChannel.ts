import type Echo from 'laravel-echo'
import type { MaybeRefOrGetter } from 'vue'
import type { SubmissionStatus } from '~/composables/useCustomOrders'

interface SubmissionStatusEvent {
  status: SubmissionStatus
  sent_at: string | null
}

type EchoInstance = Echo<'reverb'>

function getEcho(): EchoInstance | null {
  if (import.meta.server) return null
  const nuxt = useNuxtApp() as unknown as { $echo?: EchoInstance }
  return nuxt.$echo ?? null
}

function subscribe(echo: EchoInstance, orderId: number, onUpdate: (event: SubmissionStatusEvent) => void) {
  const channelName = `orders.${orderId}.submission`
  echo.private(channelName)
    .listen('.CustomOrders\\SubmissionStatusUpdated', (event: SubmissionStatusEvent) => {
      onUpdate(event)
    })
  return () => echo.leave(channelName)
}

export function useSubmissionChannels(
  orderIds: MaybeRefOrGetter<number[]>,
  onUpdate: (orderId: number, event: SubmissionStatusEvent) => void
) {
  const echo = getEcho()
  if (!echo) return

  const subscriptions = new Map<number, () => void>()

  watch(() => toValue(orderIds), (ids) => {
    const next = new Set(ids)

    for (const [id, dispose] of subscriptions) {
      if (!next.has(id)) {
        dispose()
        subscriptions.delete(id)
      }
    }

    for (const id of next) {
      if (!subscriptions.has(id)) {
        subscriptions.set(id, subscribe(echo, id, event => onUpdate(id, event)))
      }
    }
  }, { immediate: true, deep: true })

  onScopeDispose(() => {
    for (const dispose of subscriptions.values()) dispose()
    subscriptions.clear()
  })
}
