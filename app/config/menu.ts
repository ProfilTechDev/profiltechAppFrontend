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
  }
] satisfies NavigationMenuItem[]
