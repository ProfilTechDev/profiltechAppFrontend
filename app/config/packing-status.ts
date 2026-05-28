import type { DeliveryFlow } from '~/config/delivery-flow'

type BadgeColor = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'

export type PackingStatus
  = | 'not_planned'
    | 'packing'
    | 'packed'
    | 'out_for_delivery'
    | 'awaiting_pickup'
    | 'done'

interface PackingStatusMeta {
  label: string
  color: BadgeColor
  icon: string
}

const STATUS_META: Record<PackingStatus, PackingStatusMeta> = {
  not_planned: { label: 'Ikke planlagt', color: 'neutral', icon: 'i-lucide-circle-help' },
  packing: { label: 'Under pakning', color: 'warning', icon: 'i-lucide-package' },
  packed: { label: 'Pakket', color: 'info', icon: 'i-lucide-package-check' },
  out_for_delivery: { label: 'Under levering', color: 'primary', icon: 'i-lucide-truck' },
  awaiting_pickup: { label: 'Afventer afhentning', color: 'info', icon: 'i-lucide-clock' },
  done: { label: 'Færdig', color: 'success', icon: 'i-lucide-check-check' }
}

export function getPackingStatusMeta(status: PackingStatus | null | undefined): PackingStatusMeta | null {
  if (!status) return null
  return STATUS_META[status]
}

/**
 * Statuses the given flow is allowed to use, mirrored from the
 * backend PackingStatus::allowedFor() — keep these two lists in sync.
 *
 * `onTour` only matters for Delivery: an unscheduled delivery order
 * can only stay NotPlanned or jump to Done; the intermediate packing
 * states require a route assignment.
 */
export function allowedPackingStatusesFor(
  flow: DeliveryFlow | null | undefined,
  onTour: boolean = true
): PackingStatus[] {
  if (!flow) return []

  if (flow === 'delivery') {
    return onTour
      ? ['not_planned', 'packing', 'packed', 'out_for_delivery', 'done']
      : ['not_planned', 'done']
  }
  if (flow === 'shipping') return ['packing', 'done']
  return ['packing', 'awaiting_pickup', 'done']
}
