<script setup lang="ts">
import type { FormError, FormSubmitEvent } from '@nuxt/ui'
import type { User } from '~/composables/useUsers'
import { failedCriteria } from '~/utils/password-policy'

const props = defineProps<{
  open: boolean
  user: User | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'reset': []
}>()

const { resetPassword } = useUserActions()
const toast = useToast()

interface State {
  password: string
  password_confirmation: string
}

const state = reactive<State>({
  password: '',
  password_confirmation: ''
})
const isSubmitting = ref(false)
const serverErrors = ref<Record<string, string[]>>({})

watch(() => props.open, (v) => {
  if (v) {
    state.password = ''
    state.password_confirmation = ''
    serverErrors.value = {}
  }
})

function validate(s: State): FormError[] {
  const errors: FormError[] = []
  const missing = failedCriteria(s.password)
  if (missing.length > 0) {
    errors.push({ name: 'password', message: `Manglende krav: ${missing.map(c => c.label.toLowerCase()).join(', ')}.` })
  }
  if (s.password_confirmation && s.password_confirmation !== s.password) {
    errors.push({ name: 'password_confirmation', message: 'Adgangskoderne matcher ikke.' })
  }
  // Fall back to server-side messages (e.g. password.uncompromised) when
  // we have no client-side complaint about that field.
  for (const [name, messages] of Object.entries(serverErrors.value)) {
    if (errors.some(e => e.name === name) || !messages[0]) {
      continue
    }
    errors.push({ name, message: messages[0] })
  }
  return errors
}

async function onSubmit(event: FormSubmitEvent<State>) {
  if (!props.user) {
    return
  }
  isSubmitting.value = true
  serverErrors.value = {}

  try {
    await resetPassword(props.user.id, event.data)
    toast.add({
      title: 'Adgangskode nulstillet',
      description: 'Husk at give brugeren besked om det nye password.',
      color: 'success',
      icon: 'i-lucide-key-round'
    })
    emit('reset')
    emit('update:open', false)
  } catch (e: unknown) {
    const err = e as { data?: { message?: string, errors?: Record<string, string[]> } }
    if (err?.data?.errors) {
      serverErrors.value = err.data.errors
    }
    toast.add({
      title: 'Kunne ikke nulstille adgangskode',
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
    :title="user ? `Nulstil adgangskode — ${user.name}` : ''"
    description="Vælg en ny adgangskode for brugeren."
    :ui="{ content: 'max-w-lg' }"
    @update:open="emit('update:open', $event)"
  >
    <template #body>
      <UForm
        v-if="user"
        id="reset-password-form"
        :state="state"
        :validate="validate"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField
          name="password"
          label="Ny adgangskode"
          required
        >
          <UInput
            v-model="state.password"
            type="password"
            autocomplete="new-password"
            class="w-full"
          />
        </UFormField>

        <PasswordStrengthMeter :password="state.password" />

        <UFormField
          name="password_confirmation"
          label="Bekræft adgangskode"
          required
        >
          <UInput
            v-model="state.password_confirmation"
            type="password"
            autocomplete="new-password"
            class="w-full"
          />
        </UFormField>
      </UForm>
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
          label="Nulstil adgangskode"
          icon="i-lucide-key-round"
          type="submit"
          form="reset-password-form"
          :loading="isSubmitting"
        />
      </div>
    </template>
  </UModal>
</template>
