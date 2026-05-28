import type { Ref } from 'vue'

export interface UseToastActionOptions<T> {
  /** Toast title shown on success. If omitted, no success toast fires. */
  successTitle?: string
  /** Toast title shown on error. Defaults to a generic message. */
  errorTitle?: string
  /** Optional dynamic description for the success toast. */
  successDescription?: (result: T) => string | undefined
}

export interface ToastActionResult<Args extends unknown[], T> {
  /** Tracks whether the action is currently in flight. */
  loading: Ref<boolean>
  /** Run the wrapped action; resolves to the result or `undefined` on failure. */
  run: (...args: Args) => Promise<T | undefined>
}

/**
 * Wraps an async action with toast feedback and a shared loading ref.
 * The action's exception is caught and turned into an error toast; the
 * caller can rely on the resolved value being `undefined` on failure.
 *
 * Example:
 *   const { loading, run } = useToastAction(approve, {
 *     successTitle: 'Rute godkendt',
 *     errorTitle: 'Kunne ikke godkende'
 *   })
 *   await run()
 */
export function useToastAction<Args extends unknown[], T>(
  action: (...args: Args) => Promise<T>,
  options: UseToastActionOptions<T> = {}
): ToastActionResult<Args, T> {
  const toast = useToast()
  const loading = ref(false)

  async function run(...args: Args) {
    loading.value = true
    try {
      const result = await action(...args)
      if (options.successTitle) {
        toast.add({
          title: options.successTitle,
          description: options.successDescription?.(result),
          color: 'success'
        })
      }
      return result
    } catch (err) {
      toast.add({
        title: options.errorTitle ?? 'Handlingen kunne ikke gennemføres',
        description: err instanceof Error ? err.message : undefined,
        color: 'error',
        icon: 'i-lucide-triangle-alert'
      })
      return undefined
    } finally {
      loading.value = false
    }
  }

  return { loading, run }
}
