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
        class="flex items-start gap-3 px-4 py-5"
      >
        <USwitch
          v-model="line.included"
          :ui="{ base: 'cursor-pointer' }"
          class="mt-1"
        />

        <div
          class="flex flex-1 items-start gap-3 transition-opacity"
          :class="{ 'opacity-50': !line.included }"
        >
          <div class="flex-1 space-y-1">
            <div class="text-sm font-medium text-highlighted">
              {{ line.name }}
            </div>
            <div
              v-if="line.is_custom"
              class="text-xs text-muted"
            >
              Custom
            </div>
            <CustomOrdersLineAttributes :attributes="line.attributes" />
          </div>

          <div class="flex w-32 flex-col items-end gap-3">
            <div class="w-full">
              <UInputNumber
                v-model="line.quantity"
                :min="1"
                :disabled="!line.included"
                class="w-full"
              />
              <span
                v-if="line.quantity !== line.originalQuantity"
                class="mt-0.5 block text-right text-xs text-warning"
              >
                Ændret fra {{ line.originalQuantity }}
              </span>
            </div>

            <div
              v-if="line.has_thickness"
              class="flex flex-col items-end gap-1"
            >
              <div class="flex gap-1">
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
              </div>
              <span
                v-if="line.included && line.thickness === null"
                class="text-xs text-error"
              >
                Vælg tykkelse
              </span>
            </div>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>
