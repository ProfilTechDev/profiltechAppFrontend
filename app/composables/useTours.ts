import type { MaybeRefOrGetter } from 'vue'
import type { TourStatus } from '~/config/tour-status'
import type { FulfillmentOrder } from '~/composables/useFulfillmentOrders'

export interface Tour {
  id: number
  name: string
  tour_date: string
  status: TourStatus
  notes: string | null
  approved_at: string | null
  completed_at: string | null
  created_at: string | null
  updated_at: string | null
  orders_count: number
  orders: TourOrder[] | null
}

export interface TourOrder {
  primary_sequence: number
  insert_index: number
  display_sequence: string
  added_after_approval: boolean
  order: FulfillmentOrder | null
}

export interface UseToursOptions {
  page?: MaybeRefOrGetter<number>
  perPage?: MaybeRefOrGetter<number>
  status?: MaybeRefOrGetter<string>
  dateRange?: MaybeRefOrGetter<string>
  sort?: MaybeRefOrGetter<string>
}

export function useTours(options: UseToursOptions = {}) {
  const query = computed(() => ({
    'page': toValue(options.page) ?? 1,
    'per_page': toValue(options.perPage) ?? undefined,
    'sort': toValue(options.sort) || undefined,
    'filter[status]': toValue(options.status) || undefined,
    'filter[date_range]': toValue(options.dateRange) || undefined
  }))

  const { items: tours, meta, status, error, refresh } = usePaginatedList<Tour>('/tours', {
    query,
    errorTitle: 'Failed to load tours'
  })

  const client = useSanctumClient()

  function createTour(payload: { name: string, tour_date: string, notes?: string | null }) {
    return client<Tour>('/tours', { method: 'POST', body: payload })
  }

  function deleteTour(id: number) {
    return client(`/tours/${id}`, { method: 'DELETE' })
  }

  return {
    tours,
    meta,
    status,
    error,
    refresh,
    createTour,
    deleteTour
  }
}
