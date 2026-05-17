<script setup lang="ts">
import type { Provider } from '~/config/providers'
import type { LineEdit, ProviderFormState } from './types'

defineProps<{
  state: ProviderFormState
  provider: Provider
  includedLines: LineEdit[]
}>()
</script>

<template>
  <div class="space-y-4 text-sm">
    <div class="grid grid-cols-[max-content_1fr] gap-x-6 gap-y-2">
      <span class="text-muted">Modtager</span>
      <span>{{ provider.name }} — {{ provider.email }}</span>
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
          class="flex justify-between px-4 py-2"
        >
          <span>{{ line.name }}</span>
          <span class="text-muted">
            <span v-if="line.thickness !== null">{{ line.thickness }} · </span>{{ line.quantity }} stk.
          </span>
        </li>
      </ul>
    </UFormField>
  </div>
</template>
