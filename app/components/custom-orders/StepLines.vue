<script setup lang="ts">
import { THICKNESS_OPTIONS } from '~/composables/useCustomOrders'
import type { LineEdit } from './types'

defineProps<{
  lines: LineEdit[]
}>()
</script>

<template>
  <div class="space-y-3">
    <p class="text-sm text-muted">
      Marker hvilke custom-produkter der skal med, og juster antallet.
    </p>
    <ul class="divide-y divide-default rounded-md border border-default">
      <li
        v-for="line in lines"
        :key="line.id"
        class="flex items-center gap-3 px-4 py-5"
      >
        <USwitch v-model="line.included" />

        <div class="flex-1">
          <div class="text-sm font-medium text-highlighted">{{ line.name }}</div>
          <div v-if="line.is_custom" class="text-xs text-muted">Custom</div>
        </div>

        <div class="relative flex gap-1">
          <UButton
            v-for="value in THICKNESS_OPTIONS"
            :key="value"
            :label="String(value)"
            size="xs"
            :color="line.thickness === value ? 'primary' : 'neutral'"
            :variant="line.thickness === value ? 'solid' : 'outline'"
            :disabled="!line.included"
            @click="line.thickness = value"
          />
          <span
            v-if="line.included && line.thickness === null"
            class="absolute right-0 top-full mt-0.5 whitespace-nowrap text-xs text-error"
          >
            Vælg tykkelse
          </span>
        </div>

        <div class="relative w-32">
          <UInputNumber
            v-model="line.quantity"
            :min="1"
            :disabled="!line.included"
            class="w-full"
          />
          <span
            v-if="line.quantity !== line.originalQuantity"
            class="absolute right-0 top-full mt-0.5 whitespace-nowrap text-xs text-warning"
          >
            Ændret fra {{ line.originalQuantity }}
          </span>
        </div>
      </li>
    </ul>
  </div>
</template>
