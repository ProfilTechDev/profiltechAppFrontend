import type { NavigationMenuItem } from '@nuxt/ui'

export const mainMenu = [
  {
    label: 'Home',
    icon: 'i-lucide-house',
    to: '/'
  },
  {
    label: 'Inbox',
    icon: 'i-lucide-inbox',
    to: '/inbox',
    badge: '4'
  },
  {
    label: 'Customers',
    icon: 'i-lucide-users',
    to: '/customers'
  },
  {
    label: 'Custom orders',
    icon: 'i-lucide-ruler',
    to: '/custom-orders'
  },
  {
    label: 'Settings',
    to: '/settings',
    icon: 'i-lucide-settings',
    defaultOpen: false,
    type: 'trigger',
    children: [
      {
        label: 'General',
        to: '/settings',
        exact: true
      },
      {
        label: 'Members',
        to: '/settings/members'
      },
      {
        label: 'Notifications',
        to: '/settings/notifications'
      },
      {
        label: 'Security',
        to: '/settings/security'
      }
    ]
  }
] satisfies NavigationMenuItem[]

export const secondaryMenu = [
  {
    label: 'Feedback',
    icon: 'i-lucide-message-circle',
    to: 'https://github.com/nuxt-ui-templates/dashboard',
    target: '_blank'
  },
  {
    label: 'Help & Support',
    icon: 'i-lucide-info',
    to: 'https://github.com/nuxt-ui-templates/dashboard',
    target: '_blank'
  }
] satisfies NavigationMenuItem[]
