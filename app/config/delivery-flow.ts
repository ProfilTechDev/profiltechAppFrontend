type BadgeColor = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'

export type DeliveryFlow = 'delivery' | 'shipping' | 'pickup'

interface FlowMeta {
  label: string
  color: BadgeColor
  icon: string
}

const FLOW_META: Record<DeliveryFlow, FlowMeta> = {
  delivery: { label: 'Levering', color: 'primary', icon: 'i-lucide-truck' },
  shipping: { label: 'Sende', color: 'info', icon: 'i-lucide-package' },
  pickup: { label: 'Afhentning', color: 'warning', icon: 'i-lucide-store' }
}

const UNASSIGNED_META: FlowMeta = {
  label: 'Ikke tildelt',
  color: 'neutral',
  icon: 'i-lucide-circle-help'
}

export function getDeliveryFlowMeta(flow: DeliveryFlow | null | undefined): FlowMeta {
  if (!flow) return UNASSIGNED_META
  return FLOW_META[flow]
}

export const DELIVERY_FLOW_OPTIONS: { value: DeliveryFlow | 'none', label: string }[] = [
  { value: 'delivery', label: FLOW_META.delivery.label },
  { value: 'shipping', label: FLOW_META.shipping.label },
  { value: 'pickup', label: FLOW_META.pickup.label },
  { value: 'none', label: UNASSIGNED_META.label }
]
