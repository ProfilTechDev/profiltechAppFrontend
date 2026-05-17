<script setup lang="ts">
import type { FormError } from '@nuxt/ui'
import type { ProviderFormState, ProviderSelectItem } from './types'

defineProps<{
  state: ProviderFormState
  providerItems: ProviderSelectItem[]
  validate: (state: ProviderFormState) => FormError[]
}>()
</script>

<template>
  <UForm
    :state="state"
    :validate="validate"
    class="space-y-4"
  >
    <UFormField name="providerId" label="Provider" required>
      <USelect
        v-model="state.providerId"
        :items="providerItems"
        class="w-full"
      />
    </UFormField>

    <div class="grid grid-cols-3 gap-4">
      <UFormField name="orderNumber" label="Ordrenummer" required class="col-span-1">
        <UInput v-model="state.orderNumber" class="w-full" />
      </UFormField>

      <UFormField name="subject" label="Emne" required class="col-span-2">
        <UInput v-model="state.subject" class="w-full" />
      </UFormField>
    </div>

    <UFormField name="message" label="Besked">
      <UTextarea v-model="state.message" :rows="5" autoresize class="w-full" />
    </UFormField>
  </UForm>
</template>
