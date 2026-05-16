<script setup lang="ts">
definePageMeta({
  layout: false,
  sanctum: { guestOnly: true }
})

const { login } = useSanctumAuth()

const fields = [
  {
    name: 'email',
    type: 'text' as const,
    label: 'Email',
    placeholder: 'you@example.com',
    autocomplete: 'email',
    required: true,
    defaultValue: 'test@example.com'
  },
  {
    name: 'password',
    type: 'password' as const,
    label: 'Password',
    placeholder: 'Password',
    autocomplete: 'current-password',
    required: true,
    defaultValue: 'password'
  }
]

const errorMessage = ref<string | null>(null)
const isSubmitting = ref(false)

async function onSubmit(event: { data: { email: string, password: string } }) {
  errorMessage.value = null
  isSubmitting.value = true

  try {
    await login(event.data)
  } catch (error: unknown) {
    const err = error as { data?: { message?: string } }
    errorMessage.value = err?.data?.message ?? 'Login failed'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-6">
    <UAuthForm
      :fields="fields"
      title="Sign in"
      description="Enter your credentials to access your account."
      icon="i-lucide-lock"
      :submit="{ label: 'Sign in', loading: isSubmitting, block: true }"
      class="w-full max-w-md"
      @submit="onSubmit"
    >
      <template v-if="errorMessage" #footer>
        <p class="text-sm text-red-500">
          {{ errorMessage }}
        </p>
      </template>
    </UAuthForm>
  </div>
</template>
