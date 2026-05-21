import type { PermissionKey } from '~/config/permissions'

/**
 * Route-level permission guard. Activate by adding to a page's
 * definePageMeta:
 *
 *   definePageMeta({
 *     middleware: ['can'],
 *     permissions: ['users.manage']
 *   })
 *
 * Super-admins always pass. Users without the listed permission get
 * redirected to "/" with a toast. Auth itself is handled separately by
 * the nuxt-auth-sanctum global middleware.
 */
export default defineNuxtRouteMiddleware((to) => {
  const required = (to.meta.permissions ?? []) as PermissionKey[]
  if (required.length === 0) {
    return
  }

  const { user, can } = useAuthUser()

  // No user yet (e.g. SSR before hydration) — auth middleware will
  // handle redirecting to /login; we just let it through here.
  if (!user.value) {
    return
  }

  if (!can(required)) {
    if (import.meta.client) {
      useToast().add({
        title: 'Adgang nægtet',
        description: 'Du har ikke rettigheder til denne side.',
        color: 'error',
        icon: 'i-lucide-shield-off'
      })
    }
    return navigateTo('/')
  }
})
