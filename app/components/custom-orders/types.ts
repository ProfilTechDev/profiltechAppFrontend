import type { OrderAttribute, Thickness } from '~/composables/useCustomOrders'

export interface LineEdit {
  id: number
  name: string
  is_custom: boolean
  has_thickness: boolean
  attributes: OrderAttribute[]
  quantity: number
  originalQuantity: number
  included: boolean
  thickness: Thickness | null
}

export interface ProviderFormState {
  providerId: string
  orderNumber: string
  subject: string
  message: string
}

export interface ProviderSelectItem {
  label: string
  description: string
  value: string
}
