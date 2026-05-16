import type { NavigationMenuItem } from '@nuxt/ui'
import { mainMenu, secondaryMenu } from '~/config/menu'

export function useMenu(onItemSelect?: () => void) {
  const withOnSelect = (items: NavigationMenuItem[]): NavigationMenuItem[] =>
    items.map((item) => {
      if (item.children) {
        return {
          ...item,
          children: withOnSelect(item.children as NavigationMenuItem[])
        }
      }
      return onItemSelect ? { ...item, onSelect: onItemSelect } : item
    })

  return {
    mainMenu: withOnSelect(mainMenu),
    secondaryMenu
  }
}
