/**
 * Mirror of App\Authorization\Permissions on the backend. Keep keys in
 * sync; the backend rejects unknown permission strings via FormRequest
 * + UserService, so a typo here just means an unusable checkbox.
 *
 * `groups` is only used to lay out the checkbox UI — backend doesn't
 * care about grouping.
 */

export type PermissionKey
  = | 'custom-orders.view'
    | 'custom-orders.manage'
    | 'users.manage'
    | 'warehouse.access'

export interface PermissionMeta {
  key: PermissionKey
  label: string
  description: string
}

export interface PermissionGroup {
  label: string
  permissions: PermissionMeta[]
}

export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    label: 'Bestillingsordrer',
    permissions: [
      {
        key: 'custom-orders.view',
        label: 'Se bestillingsordrer',
        description: 'Læseadgang til listen og detaljer.'
      },
      {
        key: 'custom-orders.manage',
        label: 'Håndtér bestillingsordrer',
        description: 'Send bestillinger til leverandører og redigér afsendelser.'
      }
    ]
  },
  {
    label: 'Lager',
    permissions: [
      {
        key: 'warehouse.access',
        label: 'Adgang til lager',
        description: 'Pakning og forsendelse i lager-frontend.'
      }
    ]
  },
  {
    label: 'Administration',
    permissions: [
      {
        key: 'users.manage',
        label: 'Håndtér brugere',
        description: 'Opret, redigér og deaktivér brugere samt nulstil passwords.'
      }
    ]
  }
]

export const ALL_PERMISSIONS: PermissionMeta[] = PERMISSION_GROUPS.flatMap(g => g.permissions)
