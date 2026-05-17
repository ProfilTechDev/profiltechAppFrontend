import type { Ref } from 'vue'
import type { FetchError } from 'ofetch'
import type { AsyncData } from '#app'
import type { UseFetchOptions } from 'nuxt/app'

export interface UseApiFetchOptions<T> extends UseFetchOptions<T> {
  /** Suppress the default error toast for this request. */
  silent?: boolean
  /** Override the default error toast title. */
  errorTitle?: string
}

export function useApiFetch<T>(
  url: string | Ref<string> | (() => string),
  options: UseApiFetchOptions<T> = {}
): AsyncData<T | undefined, FetchError | undefined> {
  const { silent = false, errorTitle = 'Request failed', ...fetchOptions } = options

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = (useSanctumFetch as any)(url, fetchOptions) as AsyncData<T | undefined, FetchError | undefined>

  if (!silent) {
    const toast = useToast()
    watch(result.error, (err) => {
      if (!err) return
      toast.add({
        title: errorTitle,
        description: err.message,
        color: 'error',
        icon: 'i-lucide-triangle-alert'
      })
    })
  }

  return result
}
