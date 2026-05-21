import type { PermissionKey } from '~/config/permissions'

/**
 * Shape returned by GET /user — must mirror App\Data\Users\UserData.
 */
export interface AuthUser {
  id: number
  name: string
  email: string
  is_active: boolean
  deactivated_at: string | null
  email_verified_at: string | null
  has_pending_invitation: boolean
  permissions: PermissionKey[]
  created_at: string
}

/**
 * Wrapper around nuxt-auth-sanctum's `useSanctumAuth` that exposes the
 * authenticated user with permission helpers.
 */
export function useAuthUser() {
  const { user, isAuthenticated, login, logout, refreshIdentity } = useSanctumAuth<AuthUser>()

  function can(permission: PermissionKey | PermissionKey[]): boolean {
    if (!user.value) {
      return false
    }
    const required = Array.isArray(permission) ? permission : [permission]
    return required.every(p => user.value!.permissions.includes(p))
  }

  function canAny(permissions: PermissionKey[]): boolean {
    if (!user.value) {
      return false
    }
    return permissions.some(p => user.value!.permissions.includes(p))
  }

  return {
    user,
    isAuthenticated,
    can,
    canAny,
    login,
    logout,
    refreshIdentity
  }
}
