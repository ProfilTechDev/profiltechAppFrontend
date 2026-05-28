import type { Ref } from 'vue'
import type { UseApiFetchOptions } from '~/composables/useApiFetch'
import type { PaginatedResponse, PaginationMeta } from '~/composables/useCustomOrders'

/**
 * Thin wrapper around `useApiFetch` that adapts Laravel's flat paginator
 * response into a separated `items` + `meta` shape. All composables that
 * load paginated lists (custom-orders, fulfillment, tours, users) build on
 * this so the meta-extraction logic only lives in one place.
 */
export function usePaginatedList<T>(
  url: string | Ref<string> | (() => string),
  options: UseApiFetchOptions<PaginatedResponse<T>> = {}
) {
  const { data, status, error, refresh } = useApiFetch<PaginatedResponse<T>>(url, options)

  const items = computed<T[]>(() => data.value?.data ?? [])

  const meta = computed<PaginationMeta | undefined>(() => {
    const d = data.value
    if (!d) return undefined
    return {
      current_page: d.current_page,
      from: d.from,
      last_page: d.last_page,
      per_page: d.per_page,
      to: d.to,
      total: d.total,
      path: d.path
    }
  })

  return { items, meta, status, error, refresh }
}
