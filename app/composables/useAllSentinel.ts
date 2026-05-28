import type { ComputedRef, MaybeRefOrGetter } from 'vue'

/**
 * Translates the UI's `'all'` sentinel into an empty string, which our
 * API treats as "no filter". Reka-UI selects reject `value: ''` so the
 * UI side has to carry a real token (`'all'`) — this normalizes it for
 * the network layer.
 */
export function useAllSentinel(source: MaybeRefOrGetter<string>): ComputedRef<string> {
  return computed(() => {
    const value = toValue(source)
    return value === 'all' ? '' : value
  })
}
