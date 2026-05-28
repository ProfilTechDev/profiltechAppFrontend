import type { MaybeRefOrGetter } from 'vue'
import type { Tour } from '~/composables/useTours'
import type { AddTourOrderPayload } from '~/composables/useTourMutations'

/**
 * Load a single tour by id and expose its mutations. Re-fetches when
 * `tourId` changes. For dialogs that only need the mutations (they
 * already have the tour from props), use `useTourMutations` instead.
 */
export function useTour(tourId: MaybeRefOrGetter<number | null | undefined>) {
  const url = computed(() => {
    const id = toValue(tourId)
    return id ? `/tours/${id}` : ''
  })

  const { data, status, error, refresh } = useApiFetch<Tour>(url, {
    watch: [url],
    errorTitle: 'Failed to load tour'
  })

  const mutations = useTourMutations()

  function requireId(): number {
    const id = toValue(tourId)
    if (!id) throw new Error('No tour id')
    return id
  }

  return {
    tour: computed(() => data.value),
    status,
    error,
    refresh,
    update: (payload: Partial<{ name: string, tour_date: string, notes: string | null }>) =>
      mutations.update(requireId(), payload),
    addOrder: (payload: AddTourOrderPayload) =>
      mutations.addOrder(requireId(), payload),
    removeOrder: (orderId: number) =>
      mutations.removeOrder(requireId(), orderId),
    reorder: (orderIds: number[]) =>
      mutations.reorder(requireId(), orderIds),
    approve: () => mutations.approve(requireId()),
    complete: () => mutations.complete(requireId())
  }
}
