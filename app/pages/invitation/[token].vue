<script setup lang="ts">
import type { FormError, FormSubmitEvent } from '@nuxt/ui'
import type { FetchError } from 'ofetch'
import { failedCriteria } from '~/utils/password-policy'

definePageMeta({
  layout: false,
  sanctum: { guestOnly: true }
})

interface InvitationPreview {
  name: string
  email: string
  invited_by_name: string | null
  expires_at: string
}

interface AcceptState {
  password: string
  password_confirmation: string
}

const route = useRoute()
const router = useRouter()
const toast = useToast()
const client = useSanctumClient()

const token = computed(() => String(route.params.token ?? ''))

const { data: invitation, status, error } = await useApiFetch<InvitationPreview>(
  () => `/invitations/${token.value}`,
  { silent: true }
)

const state = reactive<AcceptState>({
  password: '',
  password_confirmation: ''
})
const isSubmitting = ref(false)
const serverErrors = ref<Record<string, string[]>>({})

const isExpired = computed(() => {
  const e = error.value as FetchError | undefined
  return e?.statusCode === 410
})

const isMissing = computed(() => {
  const e = error.value as FetchError | undefined
  return e?.statusCode === 404
})

const expiresAtLabel = computed(() => {
  if (!invitation.value?.expires_at) {
    return ''
  }
  return new Date(invitation.value.expires_at).toLocaleString('da-DK', {
    dateStyle: 'long',
    timeStyle: 'short'
  })
})

function validate(s: AcceptState): FormError[] {
  const errors: FormError[] = []
  const missing = failedCriteria(s.password)
  if (missing.length > 0) {
    errors.push({ name: 'password', message: `Manglende krav: ${missing.map(c => c.label.toLowerCase()).join(', ')}.` })
  }
  if (s.password_confirmation && s.password_confirmation !== s.password) {
    errors.push({ name: 'password_confirmation', message: 'Adgangskoderne matcher ikke.' })
  }
  for (const [name, messages] of Object.entries(serverErrors.value)) {
    if (errors.some(e => e.name === name) || !messages[0]) {
      continue
    }
    errors.push({ name, message: messages[0] })
  }
  return errors
}

async function onSubmit(event: FormSubmitEvent<AcceptState>) {
  isSubmitting.value = true
  serverErrors.value = {}

  try {
    await client(`/invitations/${token.value}`, {
      method: 'POST',
      body: event.data
    })
    toast.add({
      title: 'Konto aktiveret',
      description: 'Du kan nu logge ind med din nye adgangskode.',
      color: 'success',
      icon: 'i-lucide-check'
    })
    router.push('/login')
  } catch (e: unknown) {
    const err = e as { data?: { message?: string, errors?: Record<string, string[]> } }
    if (err?.data?.errors) {
      serverErrors.value = err.data.errors
    }
    toast.add({
      title: 'Kunne ikke aktivere konto',
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
  <div class="min-h-screen flex items-center justify-center p-6 bg-elevated/30">
    <UCard class="w-full max-w-md">
      <template #header>
        <div class="flex items-center gap-3">
          <UIcon
            name="i-lucide-mail-check"
            class="size-6 text-primary"
          />
          <h1 class="text-lg font-semibold">
            Aktivér din konto
          </h1>
        </div>
      </template>

      <div
        v-if="status === 'pending'"
        class="flex justify-center py-8"
      >
        <UIcon
          name="i-lucide-loader-circle"
          class="size-6 animate-spin text-muted"
        />
      </div>

      <div
        v-else-if="isMissing"
        class="space-y-3 text-center"
      >
        <UIcon
          name="i-lucide-circle-x"
          class="size-10 mx-auto text-error"
        />
        <p class="text-sm text-default">
          Invitationen findes ikke. Kontakt en administrator for at få en ny.
        </p>
        <UButton
          to="/login"
          label="Til login"
          variant="subtle"
        />
      </div>

      <div
        v-else-if="isExpired"
        class="space-y-3 text-center"
      >
        <UIcon
          name="i-lucide-clock-alert"
          class="size-10 mx-auto text-warning"
        />
        <p class="text-sm text-default">
          Invitationen er udløbet eller allerede brugt. Bed en administrator om at gensende den.
        </p>
        <UButton
          to="/login"
          label="Til login"
          variant="subtle"
        />
      </div>

      <UForm
        v-else-if="invitation"
        :state="state"
        :validate="validate"
        class="space-y-5"
        @submit="onSubmit"
      >
        <div class="space-y-1">
          <p class="text-sm text-default">
            Hej <strong>{{ invitation.name }}</strong>,
          </p>
          <p class="text-sm text-muted">
            {{ invitation.invited_by_name ? `${invitation.invited_by_name} har inviteret dig` : 'Du er inviteret' }}
            til Profiltech-administrationspanelet. Vælg en adgangskode for at fortsætte.
          </p>
        </div>

        <UFormField label="Email">
          <UInput
            :model-value="invitation.email"
            autocomplete="username"
            disabled
            class="w-full"
          />
        </UFormField>

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

        <UButton
          label="Aktivér min konto"
          icon="i-lucide-key-round"
          type="submit"
          block
          :loading="isSubmitting"
        />

        <p class="text-xs text-muted text-center">
          Linket udløber {{ expiresAtLabel }}.
        </p>
      </UForm>
    </UCard>
  </div>
</template>
