<script setup lang="ts">
const { user, logout } = useSanctumAuth()

const isLoggingOut = ref(false)

async function onLogout() {
  isLoggingOut.value = true
  try {
    await logout()
  } finally {
    isLoggingOut.value = false
  }
}
</script>

<template>
  <div class="min-h-screen p-6">
    <UCard class="max-w-2xl mx-auto">
      <template #header>
        <div class="flex items-center justify-between">
          <h1 class="text-xl font-semibold">
            Dashboard
          </h1>
          <UButton color="neutral" variant="outline" :loading="isLoggingOut" @click="onLogout">
            Log out
          </UButton>
        </div>
      </template>

      <p class="text-sm text-gray-500 mb-2">
        Signed in as:
      </p>
      <pre class="text-xs bg-gray-100 dark:bg-gray-900 p-3 rounded overflow-auto">{{ user }}</pre>
    </UCard>
  </div>
</template>
