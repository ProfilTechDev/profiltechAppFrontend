import type { MaybeRefOrGetter } from 'vue'

export interface OrderAttribute {
  key: string
  label: string
  value: string
  raw_value: string | null
}

export interface CustomOrderLine {
  id: number
  name: string
  quantity: number
  is_custom: boolean
  has_thickness: boolean
  attributes: OrderAttribute[]
}

export interface OrderCustomer {
  name: string
  email: string
  phone: string | null
}

export type SubmissionStatus = 'draft' | 'queued' | 'sent' | 'failed' | null

export interface CustomOrder {
  id: number
  wc_order_id: number
  status: string | null
  currency: string
  total: string
  date_created: string | null
  customer: OrderCustomer | null
  submission_status: SubmissionStatus
  lines: CustomOrderLine[]
}

export interface PaginationMeta {
  current_page: number
  from: number | null
  last_page: number
  per_page: number
  to: number | null
  total: number
  path: string
}

export interface PaginatedResponse<T> extends PaginationMeta {
  data: T[]
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

export interface SubmissionLine {
  id: number
  quantity: number
  included: boolean
  thickness: number | null
}

export interface Submission {
  provider_id: string | null
  subject: string | null
  message: string | null
  sent_at: string | null
  lines: SubmissionLine[]
}

export interface UseCustomOrdersOptions {
  page?: MaybeRefOrGetter<number>
  perPage?: MaybeRefOrGetter<number>
  status?: MaybeRefOrGetter<string>
  search?: MaybeRefOrGetter<string>
}

export function useCustomOrders(options: UseCustomOrdersOptions = {}) {
  const debouncedSearch = ref('')
  let searchTimer: ReturnType<typeof setTimeout> | null = null

  watch(() => toValue(options.search) ?? '', (value) => {
    if (searchTimer) clearTimeout(searchTimer)
    searchTimer = setTimeout(() => {
      debouncedSearch.value = value
    }, 300)
  }, { immediate: true })

  const query = computed(() => ({
    page: toValue(options.page) ?? 1,
    per_page: toValue(options.perPage) ?? undefined,
    'filter[status]': toValue(options.status) || undefined,
    'filter[search]': debouncedSearch.value || undefined
  }))

  const { data, status, error, refresh } = useApiFetch<PaginatedResponse<CustomOrder>>('/custom-orders', {
    query,
    errorTitle: 'Failed to load custom orders'
  })

  const client = useSanctumClient()

  function updateLines(orderId: number, lines: UpdateLinePayload[]) {
    return client<CustomOrder>(`/custom-orders/${orderId}/submission`, {
      method: 'PATCH',
      body: { lines }
    })
  }

  function updateProvider(orderId: number, payload: SendOrderPayload) {
    return client(`/custom-orders/${orderId}/submission`, {
      method: 'PATCH',
      body: payload
    })
  }

  function sendOrder(orderId: number, payload: SendOrderPayload) {
    return client(`/custom-orders/${orderId}/submission/send`, {
      method: 'POST',
      body: payload
    })
  }

  function getSubmission(orderId: number) {
    return client<Submission | null>(`/custom-orders/${orderId}/submission`)
  }

  return {
    orders: computed(() => data.value?.data ?? []),
    meta: computed<PaginationMeta | undefined>(() => {
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
    }),
    status,
    error,
    refresh,
    updateLines,
    updateProvider,
    sendOrder,
    getSubmission
  }
}
