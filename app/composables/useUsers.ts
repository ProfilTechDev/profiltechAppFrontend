import type { MaybeRefOrGetter } from 'vue'
import type { PaginatedResponse, PaginationMeta } from '~/composables/useCustomOrders'
import type { PermissionKey } from '~/config/permissions'

/**
 * Shape returned by the backend user-management endpoints — mirrors
 * App\Data\Users\UserData. Keep these aligned with the DTO.
 */
export interface User {
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

export type UserStatusFilter = 'all' | 'active' | 'inactive' | 'pending'

export interface UseUsersOptions {
  page?: MaybeRefOrGetter<number>
  perPage?: MaybeRefOrGetter<number>
  search?: MaybeRefOrGetter<string>
  status?: MaybeRefOrGetter<UserStatusFilter>
  permission?: MaybeRefOrGetter<string>
}

/**
 * Page-level list fetch for the /users admin table. Mirrors
 * useCustomOrders — same paginator shape, same debounced search.
 */
export function useUsers(options: UseUsersOptions = {}) {
  const debouncedSearch = ref('')
  let searchTimer: ReturnType<typeof setTimeout> | null = null

  watch(() => toValue(options.search) ?? '', (value) => {
    if (searchTimer) {
      clearTimeout(searchTimer)
    }
    searchTimer = setTimeout(() => {
      debouncedSearch.value = value
    }, 300)
  }, { immediate: true })

  const query = computed(() => ({
    'page': toValue(options.page) ?? 1,
    'per_page': toValue(options.perPage) ?? undefined,
    'filter[status]': toValue(options.status) && toValue(options.status) !== 'all' ? toValue(options.status) : undefined,
    'filter[permission]': toValue(options.permission) || undefined,
    'filter[search]': debouncedSearch.value || undefined
  }))

  const { data, status, error, refresh } = useApiFetch<PaginatedResponse<User>>('/users', {
    query,
    errorTitle: 'Kunne ikke hente brugere'
  })

  return {
    users: computed(() => data.value?.data ?? []),
    meta: computed<PaginationMeta | undefined>(() => {
      const d = data.value
      if (!d) {
        return undefined
      }
      return {
        current_page: d.current_page,
        from: d.from,
        last_page: d.last_page,
        per_page: d.per_page,
        to: d.to,
        total: d.total,
        path: d.path
      }
    }),
    status,
    error,
    refresh
  }
}
