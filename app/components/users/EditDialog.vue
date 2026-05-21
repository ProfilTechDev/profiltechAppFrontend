<script setup lang="ts">
import type { PermissionKey } from '~/config/permissions'
import type { User } from '~/composables/useUsers'

const props = defineProps<{
  open: boolean
  user: User | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'updated': []
}>()

const { update } = useUserActions()
const toast = useToast()

const state = ref({
  name: '',
  email: '',
  permissions: [] as PermissionKey[]
})
const isSubmitting = ref(false)
const errors = ref<Record<string, string[]>>({})

watch(() => props.user, (user) => {
  if (user) {
    state.value = {
      name: user.name,
      email: user.email,
      permissions: [...user.permissions]
    }
    errors.value = {}
  }
}, { immediate: true })

async function submit() {
  if (!props.user) {
    return
  }

  isSubmitting.value = true
  errors.value = {}

  try {
    await update(props.user.id, {
      name: state.value.name.trim(),
      email: state.value.email.trim(),
      permissions: state.value.permissions
    })
    toast.add({
      title: 'Bruger opdateret',
      color: 'success',
      icon: 'i-lucide-check'
    })
    emit('updated')
    emit('update:open', false)
  } catch (e: unknown) {
    const err = e as { data?: { message?: string, errors?: Record<string, string[]> } }
    if (err?.data?.errors) {
      errors.value = err.data.errors
    }
    toast.add({
      title: 'Kunne ikke opdatere bruger',
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
    :title="user ? `Redigér ${user.name}` : ''"
    :ui="{ content: 'max-w-2xl' }"
    @update:open="emit('update:open', $event)"
  >
    <template #body>
      <div
        v-if="user"
        class="space-y-5"
      >
        <UFormField
          label="Navn"
          :error="errors.name?.[0]"
          required
        >
          <UInput
            v-model="state.name"
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
          @click="emit('update:open', false)"
        />
        <UButton
          label="Gem ændringer"
          icon="i-lucide-save"
          :loading="isSubmitting"
          @click="submit"
        />
      </div>
    </template>
  </UModal>
</template>
