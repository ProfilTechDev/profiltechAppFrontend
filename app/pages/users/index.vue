<script setup lang="ts">
import type { DropdownMenuItem, TableColumn } from '@nuxt/ui'
import type { User, UserStatusFilter } from '~/composables/useUsers'
import { ALL_PERMISSIONS } from '~/config/permissions'

definePageMeta({
  middleware: ['can'],
  permissions: ['users.manage']
})

const page = ref(1)
const perPage = ref(20)
const search = ref('')
const statusFilter = ref<UserStatusFilter>('all')
const permissionFilter = ref<string>('all')

// Reka-UI's Select rejects empty-string option values, so 'all' is the
// UI sentinel for "no filter" — translated to undefined for the API.
const apiPermissionFilter = computed(() => permissionFilter.value === 'all' ? '' : permissionFilter.value)

const { users, meta, status, refresh } = useUsers({
  page,
  perPage,
  search,
  status: statusFilter,
  permission: apiPermissionFilter
})

const { user: currentUser } = useAuthUser()
const { remove, deactivate, reactivate, resendInvitation } = useUserActions()
const toast = useToast()

watch([search, statusFilter, permissionFilter, perPage], () => {
  page.value = 1
})

const statusOptions = [
  { label: 'Alle brugere', value: 'all' },
  { label: 'Aktive', value: 'active' },
  { label: 'Afventer invitation', value: 'pending' },
  { label: 'Deaktiverede', value: 'inactive' }
]

const permissionOptions = [
  { label: 'Alle områder', value: 'all' },
  ...ALL_PERMISSIONS.map(p => ({ label: p.label, value: p.key }))
]

const perPageOptions = [
  { label: '10', value: 10 },
  { label: '20', value: 20 },
  { label: '50', value: 50 },
  { label: '100', value: 100 }
]

const columns: TableColumn<User>[] = [
  { accessorKey: 'name', header: 'Navn' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'permissions', header: 'Adgang' },
  { accessorKey: 'actions', header: '' }
]

const isCreateOpen = ref(false)
const isEditOpen = ref(false)
const isResetOpen = ref(false)
const selectedUser = ref<User | null>(null)

function openEdit(user: User) {
  selectedUser.value = user
  isEditOpen.value = true
}

function openReset(user: User) {
  selectedUser.value = user
  isResetOpen.value = true
}

async function onResend(user: User) {
  try {
    await resendInvitation(user.id)
    toast.add({
      title: 'Invitation gensendt',
      description: `Ny invitation sendt til ${user.email}.`,
      color: 'success',
      icon: 'i-lucide-mail-check'
    })
  } catch {
    toast.add({
      title: 'Kunne ikke gensende invitation',
      color: 'error',
      icon: 'i-lucide-triangle-alert'
    })
  }
}

async function onDeactivate(user: User) {
  try {
    await deactivate(user.id)
    toast.add({ title: `${user.name} er deaktiveret`, color: 'success' })
    refresh()
  } catch {
    toast.add({ title: 'Kunne ikke deaktivere bruger', color: 'error', icon: 'i-lucide-triangle-alert' })
  }
}

async function onReactivate(user: User) {
  try {
    await reactivate(user.id)
    toast.add({ title: `${user.name} er aktiveret igen`, color: 'success' })
    refresh()
  } catch {
    toast.add({ title: 'Kunne ikke aktivere bruger', color: 'error', icon: 'i-lucide-triangle-alert' })
  }
}

async function onDelete(user: User) {
  if (!confirm(`Slet ${user.name}? Dette kan ikke fortrydes.`)) {
    return
  }
  try {
    await remove(user.id)
    toast.add({ title: 'Bruger slettet', color: 'success' })
    refresh()
  } catch {
    toast.add({ title: 'Kunne ikke slette bruger', color: 'error', icon: 'i-lucide-triangle-alert' })
  }
}

function rowMenu(user: User): DropdownMenuItem[][] {
  const isSelf = currentUser.value?.id === user.id
  const items: DropdownMenuItem[][] = [
    [
      { label: 'Redigér', icon: 'i-lucide-pencil', onSelect: () => openEdit(user) },
      { label: 'Nulstil adgangskode', icon: 'i-lucide-key-round', onSelect: () => openReset(user) }
    ]
  ]

  if (user.has_pending_invitation) {
    items[0]!.push({
      label: 'Gensend invitation',
      icon: 'i-lucide-mail-plus',
      onSelect: () => onResend(user)
    })
  }

  const dangerZone: DropdownMenuItem[] = []
  if (!isSelf) {
    if (user.is_active) {
      dangerZone.push({
        label: 'Deaktivér',
        icon: 'i-lucide-user-x',
        color: 'warning',
        onSelect: () => onDeactivate(user)
      })
    } else {
      dangerZone.push({
        label: 'Aktivér igen',
        icon: 'i-lucide-user-check',
        color: 'success',
        onSelect: () => onReactivate(user)
      })
    }
    dangerZone.push({
      label: 'Slet',
      icon: 'i-lucide-trash-2',
      color: 'error',
      onSelect: () => onDelete(user)
    })
  }
  if (dangerZone.length > 0) {
    items.push(dangerZone)
  }

  return items
}

function statusMeta(user: User): { label: string, color: 'success' | 'warning' | 'neutral' | 'info' } {
  if (user.has_pending_invitation && !user.email_verified_at) {
    return { label: 'Afventer invitation', color: 'info' }
  }
  if (!user.is_active) {
    return { label: 'Deaktiveret', color: 'neutral' }
  }
  return { label: 'Aktiv', color: 'success' }
}

function permissionLabel(key: string): string {
  return ALL_PERMISSIONS.find(p => p.key === key)?.label ?? key
}
</script>

<template>
  <UDashboardPanel id="users">
    <template #header>
      <UDashboardNavbar title="Brugere">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton
            label="Opret bruger"
            icon="i-lucide-user-plus"
            @click="isCreateOpen = true"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="rounded-lg border border-default bg-default shadow-xs">
        <div class="flex flex-wrap items-center justify-between gap-3 border-b border-default bg-elevated/30 p-4">
          <UInput
            v-model="search"
            placeholder="Søg på navn eller email"
            icon="i-lucide-search"
            size="lg"
            class="min-w-60 w-full max-w-80"
          />
          <div class="flex flex-wrap items-center gap-3">
            <USelect
              v-model="statusFilter"
              :items="statusOptions"
              icon="i-lucide-circle-dot"
              size="lg"
              class="w-52"
            />
            <USelect
              v-model="permissionFilter"
              :items="permissionOptions"
              icon="i-lucide-shield-check"
              size="lg"
              class="w-56"
            />
          </div>
        </div>

        <UTable
          :data="users"
          :columns="columns"
          :loading="status === 'pending'"
          :ui="{
            tr: 'hover:bg-elevated/40 transition-colors',
            th: 'bg-elevated/30 font-semibold',
            td: 'py-3.5'
          }"
        >
          <template #name-cell="{ row }">
            <span class="font-medium text-default">{{ row.original.name }}</span>
          </template>

          <template #status-cell="{ row }">
            <UBadge
              variant="subtle"
              :color="statusMeta(row.original).color"
              :label="statusMeta(row.original).label"
            />
          </template>

          <template #permissions-cell="{ row }">
            <div
              v-if="row.original.permissions.length === 0"
              class="text-sm text-muted"
            >
              Ingen
            </div>
            <div
              v-else
              class="flex flex-wrap gap-1"
            >
              <UBadge
                v-for="p in row.original.permissions"
                :key="p"
                variant="outline"
                color="neutral"
                size="sm"
                :label="permissionLabel(p)"
              />
            </div>
          </template>

          <template #actions-cell="{ row }">
            <div class="flex justify-end">
              <UDropdownMenu
                :items="rowMenu(row.original)"
                :content="{ align: 'end' }"
              >
                <UButton
                  icon="i-lucide-more-horizontal"
                  color="neutral"
                  variant="ghost"
                  size="sm"
                />
              </UDropdownMenu>
            </div>
          </template>
        </UTable>

        <div
          v-if="meta"
          class="grid grid-cols-1 items-center gap-3 border-t border-default px-4 py-3 sm:grid-cols-3"
        >
          <span class="text-sm text-muted sm:justify-self-start">
            Viser {{ meta.from ?? 0 }}–{{ meta.to ?? 0 }} af {{ meta.total }}
          </span>
          <UPagination
            v-if="meta.last_page > 1"
            v-model:page="page"
            :total="meta.total"
            :items-per-page="meta.per_page"
            size="sm"
            class="sm:justify-self-center"
          />
          <span
            v-else
            class="hidden sm:block"
          />
          <div class="flex items-center gap-2 sm:justify-self-end">
            <span class="text-sm text-muted">Pr. side</span>
            <USelect
              v-model="perPage"
              :items="perPageOptions"
              size="sm"
              class="w-20"
            />
          </div>
        </div>
      </div>

      <UsersCreateDialog
        v-model:open="isCreateOpen"
        @created="refresh"
      />

      <UsersEditDialog
        v-model:open="isEditOpen"
        :user="selectedUser"
        @updated="refresh"
      />

      <UsersResetPasswordDialog
        v-model:open="isResetOpen"
        :user="selectedUser"
      />
    </template>
  </UDashboardPanel>
</template>
