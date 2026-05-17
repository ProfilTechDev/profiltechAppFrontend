import type { MaybeRefOrGetter } from 'vue'

export interface CustomOrderLine {
  id: number
  name: string
  quantity: number
  is_custom: boolean
}

export interface CustomOrder {
  id: number
  wc_order_id: number
  wc_modified_at: string
  customer_name: string
  lines: CustomOrderLine[]
}

export interface PaginationMeta {
  current_page: number
  from: number
  last_page: number
  per_page: number
  to: number
  total: number
  path: string
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
  links: {
    first: string | null
    last: string | null
    prev: string | null
    next: string | null
  }
}

export interface UpdateLinePayload {
  id: number
  quantity: number
  included: boolean
  thickness: number | null
}

export const THICKNESS_OPTIONS = [0.4, 0.5] as const
export type Thickness = typeof THICKNESS_OPTIONS[number]

export interface SendOrderPayload {
  provider_id: string
  subject: string
  message: string
}

export function useCustomOrders(page: MaybeRefOrGetter<number> = 1) {
  const { data, status, error, refresh } = useApiFetch<PaginatedResponse<CustomOrder>>('/custom-orders', {
    query: { page },
    errorTitle: 'Failed to load custom orders'
  })

  const client = useSanctumClient()

  function updateLines(orderId: number, lines: UpdateLinePayload[]) {
    return client<CustomOrder>(`/custom-orders/${orderId}`, {
      method: 'PATCH',
      body: { lines }
    })
  }

  function sendOrder(orderId: number, payload: SendOrderPayload) {
    return client(`/custom-orders/${orderId}/send`, {
      method: 'POST',
      body: payload
    })
  }

  return {
    orders: computed(() => data.value?.data ?? []),
    meta: computed(() => data.value?.meta),
    status,
    error,
    refresh,
    updateLines,
    sendOrder
  }
}
