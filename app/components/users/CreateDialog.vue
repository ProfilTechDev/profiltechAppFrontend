<script setup lang="ts">
import type { PermissionKey } from '~/config/permissions'

defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'created': []
}>()

const { create } = useUserActions()
const toast = useToast()

const initialState = () => ({
  name: '',
  email: '',
  permissions: [] as PermissionKey[]
})

const state = ref(initialState())
const isSubmitting = ref(false)
const errors = ref<Record<string, string[]>>({})

function close() {
  emit('update:open', false)
  state.value = initialState()
  errors.value = {}
}

async function submit() {
  if (!state.value.name.trim() || !state.value.email.trim()) {
    errors.value = {
      name: state.value.name.trim() ? [] : ['Navn er påkrævet'],
      email: state.value.email.trim() ? [] : ['Email er påkrævet']
    }
    return
  }

  isSubmitting.value = true
  errors.value = {}

  try {
    await create({
      name: state.value.name.trim(),
      email: state.value.email.trim(),
      permissions: state.value.permissions
    })
    toast.add({
      title: 'Bruger oprettet',
      description: 'Invitationsmail er sendt.',
      color: 'success',
      icon: 'i-lucide-mail-check'
    })
    emit('created')
    close()
  } catch (e: unknown) {
    const err = e as { data?: { message?: string, errors?: Record<string, string[]> } }
    if (err?.data?.errors) {
      errors.value = err.data.errors
    }
    toast.add({
      title: 'Kunne ikke oprette bruger',
      description: err?.data?.message ?? 'Ukendt fejl',
      color: 'error',
      icon: 'i-lucide-triangle-alert'
    })
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <UModal
    :open="open"
    title="Opret bruger"
    description="Brugeren modtager en invitationsmail med link til at sætte password."
    :ui="{ content: 'max-w-2xl' }"
    @update:open="emit('update:open', $event)"
  >
    <template #body>
      <div class="space-y-5">
        <UFormField
          label="Navn"
          :error="errors.name?.[0]"
          required
        >
          <UInput
            v-model="state.name"
            autofocus
            placeholder="Fornavn Efternavn"
            class="w-full"
          />
        </UFormField>

        <UFormField
          label="Email"
          :error="errors.email?.[0]"
          required
        >
          <UInput
            v-model="state.email"
            type="email"
            autocomplete="off"
            placeholder="navn@profiltech.dk"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Adgang">
          <UsersPermissionsField v-model="state.permissions" />
        </UFormField>
      </div>
    </template>

    <template #footer>
      <div class="flex w-full justify-between">
        <UButton
          label="Annullér"
          color="neutral"
          variant="subtle"
          :disabled="isSubmitting"
          @click="close"
        />
        <UButton
          label="Opret og send invitation"
          icon="i-lucide-mail-plus"
          :loading="isSubmitting"
          @click="submit"
        />
      </div>
    </template>
  </UModal>
</template>
