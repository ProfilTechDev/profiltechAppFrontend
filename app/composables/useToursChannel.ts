import type Echo from 'laravel-echo'

type EchoInstance = Echo<'reverb'>

function getEcho(): EchoInstance | null {
  if (import.meta.server) return null
  const nuxt = useNuxtApp() as unknown as { $echo?: EchoInstance }
  return nuxt.$echo ?? null
}

/**
 * Subscribe to the general tours channel. Used by the tour list to
 * pick up status changes happening from elsewhere (another admin's
 * "approve" click).
 */
export function useToursChannel(onUpdate: () => void) {
  const echo = getEcho()
  if (!echo) return

  echo.private('tours').listen('.Tours\\TourStatusUpdated', onUpdate)

  onScopeDispose(() => echo.leave('tours'))
}
