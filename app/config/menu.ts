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
    label: 'Menu',
    type: 'label',
    class: 'mt-3 font-light text-gray-500'
  },
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
    label: 'Levering',
    icon: 'i-lucide-truck',
    defaultOpen: true,
    children: [
      {
        label: 'Ordreoverblik',
        icon: 'i-lucide-clipboard-list',
        to: '/ordreoverblik'
      },
      {
        label: 'Selvdistribution',
        icon: 'i-lucide-route',
        to: '/selvdistribution'
      }
    ]
  },
  {
    label: 'Indstillinger',
    type: 'label',
    class: 'mt-4 font-light text-gray-500'
  },
  {
    label: 'Brugere',
    icon: 'i-lucide-users',
    to: '/users',
    permissions: ['users.manage']
  }
]
