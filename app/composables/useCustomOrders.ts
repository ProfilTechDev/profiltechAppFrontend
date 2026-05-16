export type CustomOrderStatus = 'pending' | 'in_production' | 'completed' | 'cancelled'

export interface CustomOrder {
  id: number
  orderNumber: string
  customer: string
  product: string
  specifications: string
  status: CustomOrderStatus
  createdAt: string
}

const mockOrders: CustomOrder[] = [
  {
    id: 1,
    orderNumber: 'CO-2026-001',
    customer: 'Hansen Møbler ApS',
    product: 'Aluminium profile',
    specifications: 'Length: 2450mm, RAL 7016',
    status: 'in_production',
    createdAt: '2026-05-10'
  },
  {
    id: 2,
    orderNumber: 'CO-2026-002',
    customer: 'Nordic Interior A/S',
    product: 'Cover plate',
    specifications: 'Custom width: 87mm, anodized',
    status: 'pending',
    createdAt: '2026-05-12'
  },
  {
    id: 3,
    orderNumber: 'CO-2026-003',
    customer: 'Byggematerialer ApS',
    product: 'Corner profile',
    specifications: 'RAL 9005 matte, length 3000mm',
    status: 'completed',
    createdAt: '2026-05-08'
  },
  {
    id: 4,
    orderNumber: 'CO-2026-004',
    customer: 'Jensen & Søn',
    product: 'U-profile',
    specifications: 'Special angle 87°, brushed finish',
    status: 'in_production',
    createdAt: '2026-05-14'
  },
  {
    id: 5,
    orderNumber: 'CO-2026-005',
    customer: 'Møbelfabrikken',
    product: 'T-profile',
    specifications: 'Length 1850mm, RAL 5012',
    status: 'cancelled',
    createdAt: '2026-05-06'
  }
]

export function useCustomOrders() {
  // TODO: replace with useFetch('/api/custom-orders') when backend is ready
  const orders = ref<CustomOrder[]>(mockOrders)
  const pending = ref(false)
  const error = ref<Error | null>(null)

  return {
    orders: readonly(orders),
    pending: readonly(pending),
    error: readonly(error)
  }
}
