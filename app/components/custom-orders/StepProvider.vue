<script setup lang="ts">
// The parent owns `state` as a `reactive(...)` form state and lets this
// child v-model fields directly. That's a legitimate Vue 3 pattern for
// nested form state — fewer events, less plumbing — but it trips the
// "no-mutating-props" rule which can't tell the difference. Disabled
// at the file level to keep the form layout flat and readable.
/* eslint-disable vue/no-mutating-props */
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
    <UFormField
      name="providerId"
      label="Provider"
      required
    >
      <USelect
        v-model="state.providerId"
        :items="providerItems"
        class="w-full"
      />
    </UFormField>

    <div class="grid grid-cols-3 gap-4">
      <UFormField
        name="orderNumber"
        label="Ordrenummer"
        required
        class="col-span-1"
      >
        <UInput
          v-model="state.orderNumber"
          class="w-full"
        />
      </UFormField>

      <UFormField
        name="subject"
        label="Emne"
        required
        class="col-span-2"
      >
        <UInput
          v-model="state.subject"
          class="w-full"
        />
      </UFormField>
    </div>

    <UFormField
      name="message"
      label="Besked"
    >
      <UTextarea
        v-model="state.message"
        :rows="5"
        autoresize
        class="w-full"
      />
    </UFormField>
  </UForm>
</template>
