import type { MaybeRefOrGetter } from 'vue'
import type { Department } from '~/config/department'
import type { DeliveryFlow } from '~/config/delivery-flow'
import type { PackingStatus } from '~/config/packing-status'
import type { TourStatus } from '~/config/tour-status'
import type {
  CustomOrderLine,
  OrderCustomer,
  SubmissionStatus
} from '~/composables/useCustomOrders'

export interface ShippingAddress {
  name: string
  company: string | null
  address_1: string
  address_2: string | null
  city: string
  postcode: string
  country: string
  phone: string | null
}

export interface TourAssignment {
  tour_id: number
  tour_name: string
  tour_date: string
  tour_status: TourStatus
  display_sequence: string
  primary_sequence: number
  insert_index: number
  added_after_approval: boolean
}

export interface FulfillmentOrderLine extends CustomOrderLine {
  department: Department | null
}

export interface FulfillmentOrder {
  id: number
  wc_order_id: number
  wc_number: string | null
  status: string
  currency: string
  total: string
  customer_note: string | null
  date_created: string | null
  date_paid: string | null
  customer: OrderCustomer | null
  submission_status: SubmissionStatus
  delivery_flow: DeliveryFlow | null
  packing_status: PackingStatus | null
  packing_ready_at: string | null
  shipping_address: ShippingAddress | null
  tour_assignment: TourAssignment | null
  lines: FulfillmentOrderLine[]
}

export interface UseFulfillmentOrdersOptions {
  page?: MaybeRefOrGetter<number>
  perPage?: MaybeRefOrGetter<number>
  /** Comma-separated list of flows, or 'none' for unassigned. */
  deliveryFlow?: MaybeRefOrGetter<string>
  department?: MaybeRefOrGetter<string>
  /** 'yes' | 'no' */
  onTour?: MaybeRefOrGetter<string>
  search?: MaybeRefOrGetter<string>
  sort?: MaybeRefOrGetter<string>
}

export function useFulfillmentOrders(options: UseFulfillmentOrdersOptions = {}) {
  const debouncedSearch = useDebouncedRef(() => toValue(options.search) ?? '', 300)

  const query = computed(() => ({
    'page': toValue(options.page) ?? 1,
    'per_page': toValue(options.perPage) ?? undefined,
    'sort': toValue(options.sort) || undefined,
    'filter[delivery_flow]': toValue(options.deliveryFlow) || undefined,
    'filter[department]': toValue(options.department) || undefined,
    'filter[on_tour]': toValue(options.onTour) || undefined,
    'filter[search]': debouncedSearch.value || undefined
  }))

  const { items: orders, meta, status, error, refresh } = usePaginatedList<FulfillmentOrder>('/fulfillment', {
    query,
    errorTitle: 'Failed to load planning list'
  })

  const client = useSanctumClient()

  function setFlow(orderId: number, flow: DeliveryFlow | null) {
    return client<FulfillmentOrder>(`/fulfillment/orders/${orderId}/flow`, {
      method: 'PATCH',
      body: { delivery_flow: flow }
    })
  }

  function setPackingStatus(orderId: number, status: PackingStatus | null) {
    return client<FulfillmentOrder>(`/fulfillment/orders/${orderId}/packing-status`, {
      method: 'PATCH',
      body: { packing_status: status }
    })
  }

  return {
    orders,
    meta,
    status,
    error,
    refresh,
    setFlow,
    setPackingStatus
  }
}
