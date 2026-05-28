import type { MaybeRefOrGetter, Ref } from 'vue'

/**
 * Tracks `source` and emits the value via the returned ref after `delay` ms
 * of inactivity. Useful for debouncing search inputs before they hit an API.
 */
export function useDebouncedRef<T>(source: MaybeRefOrGetter<T>, delay = 300): Ref<T> {
  const debounced = ref(toValue(source)) as Ref<T>
  let timer: ReturnType<typeof setTimeout> | null = null

  watch(() => toValue(source), (value) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      debounced.value = value
    }, delay)
  }, { immediate: true })

  onScopeDispose(() => {
    if (timer) clearTimeout(timer)
  })

  return debounced
}
