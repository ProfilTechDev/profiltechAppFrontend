<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { Tour } from '~/composables/useTours'
import { TABLE_UI } from '~/config/table-ui'
import { getTourStatusMeta } from '~/config/tour-status'

const page = ref(1)
const perPage = ref(20)
const statusFilter = ref<'all' | 'draft' | 'approved' | 'completed' | 'draft,approved'>('draft,approved')

const { tours, meta, status, refresh } = useTours({
  page,
  perPage,
  status: useAllSentinel(statusFilter),
  sort: '-tour_date'
})

useToursChannel(() => refresh())

watch([statusFilter, perPage], () => {
  page.value = 1
})

const statusOptions = [
  { label: 'Aktive (kladde + godkendt)', value: 'draft,approved' },
  { label: 'Kun kladder', value: 'draft' },
  { label: 'Godkendte', value: 'approved' },
  { label: 'Færdige', value: 'completed' },
  { label: 'Alle', value: 'all' }
]

const columns: TableColumn<Tour>[] = [
  { accessorKey: 'tour_date', header: 'Dato' },
  { accessorKey: 'name', header: 'Navn' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'orders_count', header: 'Ordrer' }
]

const createOpen = ref(false)
const router = useRouter()

function onCreated(id: number) {
  router.push(`/selvdistribution/${id}`)
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('da-DK', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })
}
</script>

<template>
  <UDashboardPanel id="selvdistribution">
    <template #header>
      <UDashboardNavbar title="Selvdistribution">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton
            icon="i-lucide-plus"
            color="primary"
            @click="createOpen = true"
          >
            Opret rute
          </UButton>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="rounded-lg border border-default bg-default shadow-xs">
        <AppFilterBar :searchable="false">
          <USelect
            v-model="statusFilter"
            :items="statusOptions"
            value-key="value"
            size="lg"
            class="w-64"
          />
        </AppFilterBar>

        <UTable
          :data="tours"
          :columns="columns"
          :loading="status === 'pending'"
          class="min-h-[300px]"
          :ui="TABLE_UI"
          :row-click="(row: Tour) => $router.push(`/selvdistribution/${row.id}`)"
        >
          <template #tour_date-cell="{ row }">
            {{ formatDate(row.original.tour_date) }}
          </template>

          <template #name-cell="{ row }">
            <NuxtLink
              :to="`/selvdistribution/${row.original.id}`"
              class="font-medium text-primary hover:underline"
            >
              {{ row.original.name }}
            </NuxtLink>
          </template>

          <template #status-cell="{ row }">
            <UBadge
              :color="getTourStatusMeta(row.original.status).color"
              variant="subtle"
            >
              {{ getTourStatusMeta(row.original.status).label }}
            </UBadge>
          </template>

          <template #orders_count-cell="{ row }">
            {{ row.original.orders_count }}
          </template>
        </UTable>

        <AppPaginationFooter
          v-model:page="page"
          v-model:per-page="perPage"
          :meta="meta"
        />
      </div>

      <ToursTourCreateDialog
        v-model:open="createOpen"
        @created="onCreated"
      />
    </template>
  </UDashboardPanel>
</template>
