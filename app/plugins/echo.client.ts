import Echo from 'laravel-echo'
import Pusher from 'pusher-js'
import type { ChannelAuthorizationCallback, ChannelAuthorizationData } from 'pusher-js/types/src/core/auth/options'

declare global {
  interface Window {
    Pusher: typeof Pusher
  }
}

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const sanctumClient = useSanctumClient()

  window.Pusher = Pusher

  const echo = new Echo({
    broadcaster: 'reverb',
    key: config.public.reverb.appKey,
    wsHost: config.public.reverb.host,
    wsPort: config.public.reverb.port,
    wssPort: config.public.reverb.port,
    forceTLS: config.public.reverb.scheme === 'https',
    enabledTransports: ['ws', 'wss'],
    authorizer: (channel: { name: string }) => ({
      authorize: (socketId: string, callback: ChannelAuthorizationCallback) => {
        sanctumClient<ChannelAuthorizationData>('/broadcasting/auth', {
          method: 'POST',
          body: {
            socket_id: socketId,
            channel_name: channel.name
          }
        })
          .then(data => callback(null, data))
          .catch(err => callback(err as Error, null))
      }
    })
  })

  return {
    provide: { echo }
  }
})
