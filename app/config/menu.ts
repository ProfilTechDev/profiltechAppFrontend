import type { NavigationMenuItem } from '@nuxt/ui'
import type { PermissionKey } from '~/config/permissions'

/**
 * Menu items optionally gated on permissions. `useMenu` filters out
 * items the current user doesn't have access to. Items without
 * `permissions` are visible to everyone.
 */
export interface AppMenuItem extends NavigationMenuItem {
  permissions?: PermissionKey[]
}

export const mainMenu: AppMenuItem[] = [
  {
    label: 'Home',
    icon: 'i-lucide-house',
    to: '/'
  },
  {
    label: 'Bestillingsordrer',
    icon: 'i-lucide-ruler',
    to: '/custom-orders',
    permissions: ['custom-orders.view']
  },
  {
    label: 'Brugere',
    icon: 'i-lucide-users',
    to: '/users',
    permissions: ['users.manage']
  }
]
