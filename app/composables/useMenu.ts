import type { NavigationMenuItem } from '@nuxt/ui'
import { mainMenu, type AppMenuItem } from '~/config/menu'

/**
 * Build the sidebar menu. Filters items by the current user's
 * permissions and optionally attaches an `onSelect` to every leaf so
 * the sidebar can close on mobile.
 */
export function useMenu(onItemSelect?: () => void) {
  const { can } = useAuthUser()

  const isVisible = (item: AppMenuItem): boolean => {
    if (!item.permissions || item.permissions.length === 0) {
      return true
    }
    return can(item.permissions)
  }

  const transform = (items: AppMenuItem[]): NavigationMenuItem[] =>
    items
      .filter(isVisible)
      .map((item) => {
        if (item.children) {
          return {
            ...item,
            children: transform(item.children as AppMenuItem[])
          }
        }
        return onItemSelect ? { ...item, onSelect: onItemSelect } : item
      })

  return {
    mainMenu: computed(() => transform(mainMenu))
  }
}
