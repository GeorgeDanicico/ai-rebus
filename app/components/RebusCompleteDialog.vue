<template>
  <UModal :open="open" :dismissible="false" @update:open="(value) => emit('update:open', value)">
    <UCard class="border-0 bg-white/95 shadow-xl ring-1 ring-slate-200/70">
      <div class="space-y-4 p-6">
        <div class="space-y-2">
          <p class="text-xs uppercase tracking-[0.3em] text-slate-400">
            Rebus Solved
          </p>
          <h2 class="text-2xl font-semibold text-slate-900">
            Congratulations!
          </h2>
          <p class="text-sm text-slate-500">
            You filled in every word correctly. Want another challenge?
          </p>
        </div>
        <div class="flex flex-wrap justify-end gap-3">
          <UButton color="neutral" variant="ghost" class="rounded-full" @click="closeDialog">
            Close
          </UButton>
          <UButton color="primary" variant="solid" class="rounded-full" @click="handleRegenerate">
            Generate another rebus
          </UButton>
        </div>
      </div>
    </UCard>
  </UModal>
</template>

<script setup lang="ts">
defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  (event: 'update:open', value: boolean): void
  (event: 'regenerate'): void
}>()

const closeDialog = () => {
  emit('update:open', false)
}

const handleRegenerate = () => {
  emit('update:open', false)
  emit('regenerate')
}
</script>
