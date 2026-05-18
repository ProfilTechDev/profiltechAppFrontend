<script setup lang="ts">
import type { Provider } from '~/composables/useProviders'
import type { LineEdit, ProviderFormState } from './types'

defineProps<{
  state: ProviderFormState
  provider: Provider | null
  includedLines: LineEdit[]
}>()
</script>

<template>
  <div class="space-y-4 text-sm">
    <div class="grid grid-cols-[max-content_1fr] gap-x-6 gap-y-2">
      <span class="text-muted">Modtager</span>
      <span>{{ provider ? `${provider.name} — ${provider.email}` : '—' }}</span>
      <span class="text-muted">Ordrenummer</span>
      <span>{{ state.orderNumber }}</span>
      <span class="text-muted">Emne</span>
      <span>{{ state.subject }}</span>
    </div>

    <UFormField label="Besked">
      <p class="whitespace-pre-wrap rounded-md border border-default bg-elevated p-3">{{ state.message }}</p>
    </UFormField>

    <UFormField :label="`Linjer (${includedLines.length})`">
      <ul class="divide-y divide-default rounded-md border border-default">
        <li
          v-for="line in includedLines"
          :key="line.id"
          class="flex items-start justify-between gap-4 px-4 py-2"
        >
          <div class="space-y-1">
            <div>{{ line.name }}</div>
            <CustomOrdersLineAttributes :attributes="line.attributes" />
          </div>
          <span class="whitespace-nowrap text-muted">
            <span v-if="line.thickness !== null">{{ line.thickness }} · </span>{{ line.quantity }} stk.
          </span>
        </li>
      </ul>
    </UFormField>
  </div>
</template>
