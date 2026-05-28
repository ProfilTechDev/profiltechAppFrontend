<script setup lang="ts">
const open = defineModel<boolean>('open', { required: true })

const emit = defineEmits<{
  created: [tourId: number]
}>()

const { createTour } = useTours()
const toast = useToast()

const form = reactive({
  name: '',
  tour_date: '',
  notes: ''
})

const saving = ref(false)

watch(open, (value) => {
  if (value) {
    form.name = ''
    form.tour_date = new Date().toISOString().slice(0, 10)
    form.notes = ''
  }
})

async function submit() {
  if (!form.name || !form.tour_date) return
  saving.value = true
  try {
    const tour = await createTour({
      name: form.name,
      tour_date: form.tour_date,
      notes: form.notes || null
    })
    toast.add({ title: 'Rute oprettet', color: 'success' })
    emit('created', tour.id)
    open.value = false
  } catch (e) {
    toast.add({
      title: 'Kunne ikke oprette rute',
      description: e instanceof Error ? e.message : undefined,
      color: 'error'
    })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <UModal
    v-model:open="open"
    title="Opret rute"
  >
    <template #body>
      <form
        class="space-y-4"
        @submit.prevent="submit"
      >
        <UFormField
          label="Navn"
          required
        >
          <UInput
            v-model="form.name"
            placeholder="f.eks. Tirsdag Sjælland-rute"
            class="w-full"
          />
        </UFormField>
        <UFormField
          label="Dato"
          required
        >
          <UInput
            v-model="form.tour_date"
            type="date"
            class="w-full"
          />
        </UFormField>
        <UFormField label="Noter">
          <UTextarea
            v-model="form.notes"
            :rows="3"
            class="w-full"
          />
        </UFormField>
      </form>
    </template>
    <template #footer>
      <div class="flex justify-end gap-2 w-full">
        <UButton
          variant="ghost"
          color="neutral"
          @click="open = false"
        >
          Annullér
        </UButton>
        <UButton
          :loading="saving"
          color="primary"
          @click="submit"
        >
          Opret
        </UButton>
      </div>
    </template>
  </UModal>
</template>
