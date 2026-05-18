import type { NavigationMenuItem } from '@nuxt/ui'

export const mainMenu = [
  {
    label: 'Home',
    icon: 'i-lucide-house',
    to: '/'
  },
  {
    label: 'Bestillingsordrer',
    icon: 'i-lucide-ruler',
    to: '/custom-orders'
  },
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
