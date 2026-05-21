import type { PermissionKey } from '~/config/permissions'
import type { User } from '~/composables/useUsers'

export interface CreateUserPayload {
  name: string
  email: string
  permissions: PermissionKey[]
}

export interface UpdateUserPayload {
  name?: string
  email?: string
  permissions?: PermissionKey[]
}

export interface ResetPasswordPayload {
  password: string
  password_confirmation: string
}

/**
 * Imperative mutations for the admin user management UI. All calls go
 * through useSanctumClient so the Sanctum cookie + XSRF header are
 * applied automatically.
 */
export function useUserActions() {
  const client = useSanctumClient()

  function create(payload: CreateUserPayload) {
    return client<User>('/users', {
      method: 'POST',
      body: payload
    })
  }

  function update(id: number, payload: UpdateUserPayload) {
    return client<User>(`/users/${id}`, {
      method: 'PATCH',
      body: payload
    })
  }

  function remove(id: number) {
    return client(`/users/${id}`, {
      method: 'DELETE'
    })
  }

  function deactivate(id: number) {
    return client<User>(`/users/${id}/deactivate`, {
      method: 'POST'
    })
  }

  function reactivate(id: number) {
    return client<User>(`/users/${id}/reactivate`, {
      method: 'POST'
    })
  }

  function resetPassword(id: number, payload: ResetPasswordPayload) {
    return client(`/users/${id}/reset-password`, {
      method: 'POST',
      body: payload
    })
  }

  function resendInvitation(id: number) {
    return client(`/users/${id}/resend-invitation`, {
      method: 'POST'
    })
  }

  return {
    create,
    update,
    remove,
    deactivate,
    reactivate,
    resetPassword,
    resendInvitation
  }
}
