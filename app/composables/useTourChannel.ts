import type Echo from 'laravel-echo'
import type { MaybeRefOrGetter } from 'vue'

type EchoInstance = Echo<'reverb'>

function getEcho(): EchoInstance | null {
  if (import.meta.server) return null
  const nuxt = useNuxtApp() as unknown as { $echo?: EchoInstance }
  return nuxt.$echo ?? null
}

/**
 * Subscribe to a single tour's real-time channel. Fires `onUpdate`
 * whenever any of TourStatusUpdated / TourOrderAdded / TourOrderRemoved
 * / TourReordered arrives. The caller is expected to `refresh()` the
 * tour query — the payloads are intentionally minimal.
 *
 * Reactive: when the tour id changes, the previous channel is left
 * cleanly. Cleans up automatically when the scope is disposed.
 */
export function useTourChannel(
  tourId: MaybeRefOrGetter<number | null | undefined>,
  onUpdate: () => void
) {
  const echo = getEcho()
  if (!echo) return

  let currentChannel: string | null = null

  function attach(id: number) {
    const name = `tours.${id}`
    echo!.private(name)
      .listen('.Tours\\TourStatusUpdated', onUpdate)
      .listen('.Tours\\TourOrderAdded', onUpdate)
      .listen('.Tours\\TourOrderRemoved', onUpdate)
      .listen('.Tours\\TourReordered', onUpdate)
    currentChannel = name
  }

  function detach() {
    if (currentChannel) {
      echo!.leave(currentChannel)
      currentChannel = null
    }
  }

  watch(() => toValue(tourId), (id) => {
    detach()
    if (id) attach(id)
  }, { immediate: true })

  onScopeDispose(detach)
}
