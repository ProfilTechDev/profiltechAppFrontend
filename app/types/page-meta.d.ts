import type { PermissionKey } from '~/config/permissions'

declare module '#app' {
  interface PageMeta {
    /**
     * Permissions required to access this route. Read by the `can`
     * middleware — list it under `middleware: ['can']` to enforce.
     */
    permissions?: PermissionKey[]
  }
}

declare module 'vue-router' {
  interface RouteMeta {
    permissions?: PermissionKey[]
  }
}

export {}
