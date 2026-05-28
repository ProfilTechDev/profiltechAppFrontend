import type { Tour } from '~/composables/useTours'

export interface AddTourOrderPayload {
  order_id: number
  after_primary?: number | null
  at_primary?: number | null
}

/**
 * Tour write operations without the `/tours/{id}` GET that `useTour`
 * triggers. Use this from dialogs that already have the tour data via
 * props — fetching it again just to mutate is wasteful.
 */
export function useTourMutations() {
  const client = useSanctumClient()

  function update(tourId: number, payload: Partial<{ name: string, tour_date: string, notes: string | null }>) {
    return client<Tour>(`/tours/${tourId}`, { method: 'PATCH', body: payload })
  }

  function addOrder(tourId: number, payload: AddTourOrderPayload) {
    return client(`/tours/${tourId}/orders`, { method: 'POST', body: payload })
  }

  function removeOrder(tourId: number, orderId: number) {
    return client(`/tours/${tourId}/orders/${orderId}`, { method: 'DELETE' })
  }

  function reorder(tourId: number, orderIds: number[]) {
    return client<Tour>(`/tours/${tourId}/reorder`, {
      method: 'POST',
      body: { order_ids: orderIds }
    })
  }

  function approve(tourId: number) {
    return client<Tour>(`/tours/${tourId}/approve`, { method: 'POST' })
  }

  function complete(tourId: number) {
    return client<Tour>(`/tours/${tourId}/complete`, { method: 'POST' })
  }

  return { update, addOrder, removeOrder, reorder, approve, complete }
}
