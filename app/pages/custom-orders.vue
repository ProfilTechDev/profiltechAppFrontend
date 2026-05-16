<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { CustomOrder, CustomOrderStatus } from '~/composables/useCustomOrders'

const { orders } = useCustomOrders()

const columns: TableColumn<CustomOrder>[] = [
  { accessorKey: 'orderNumber', header: 'Order #' },
  { accessorKey: 'customer', header: 'Customer' },
  { accessorKey: 'product', header: 'Product' },
  { accessorKey: 'specifications', header: 'Specifications' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'createdAt', header: 'Created' }
]

const statusColor: Record<CustomOrderStatus, 'neutral' | 'warning' | 'info' | 'success' | 'error'> = {
  pending: 'warning',
  in_production: 'info',
  completed: 'success',
  cancelled: 'error'
}

const statusLabel: Record<CustomOrderStatus, string> = {
  pending: 'Pending',
  in_production: 'In production',
  completed: 'Completed',
  cancelled: 'Cancelled'
}
</script>

<template>
  <UDashboardPanel id="custom-orders">
    <template #header>
      <UDashboardNavbar title="Custom orders" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UTable
        :data="orders"
        :columns="columns"
      >
        <template #status-cell="{ row }">
          <UBadge
            :color="statusColor[row.original.status]"
            variant="subtle"
          >
            {{ statusLabel[row.original.status] }}
          </UBadge>
        </template>
      </UTable>
    </template>
  </UDashboardPanel>
</template>
