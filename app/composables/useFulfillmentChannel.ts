import type Echo from 'laravel-echo'

type EchoInstance = Echo<'reverb'>

function getEcho(): EchoInstance | null {
  if (import.meta.server) return null
  const nuxt = useNuxtApp() as unknown as { $echo?: EchoInstance }
  return nuxt.$echo ?? null
}

/**
 * Subscribe to the shared fulfilment channel. Fires `onUpdate` on
 * either OrderPackingReady (new order surfaced in the planning list)
 * or OrderFlowChanged (an order moved between buckets). The caller
 * refreshes its own query — we don't try to surgically patch rows.
 */
export function useFulfillmentChannel(onUpdate: () => void) {
  const echo = getEcho()
  if (!echo) return

  echo.private('fulfillment')
    .listen('.Fulfillment\\OrderPackingReady', onUpdate)
    .listen('.Fulfillment\\OrderFlowChanged', onUpdate)

  onScopeDispose(() => echo.leave('fulfillment'))
}
