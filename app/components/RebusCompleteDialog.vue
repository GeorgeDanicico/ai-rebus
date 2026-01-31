<template>
  <UModal 
    :open="open" 
    :dismissible="false" 
    @update:open="(value) => emit('update:open', value)"
    title="Congratulations"
    description=""
  >
    <template #body>
      <div class="space-y-4 p-6">
        <div class="space-y-2">
          <p class="text-xs uppercase tracking-[0.3em] text-slate-400">
            Rebus Solved
          </p>
          <p class="text-sm text-slate-500">
            You filled in every word correctly. Want another challenge?
          </p>
        </div>
        <div class="flex flex-wrap justify-end gap-3">
          <UButton color="primary" variant="solid" class="rounded-full" @click="handleRegenerate">
            Generate another rebus
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
defineProps<{
  open: boolean
}>();

const emit = defineEmits<{
  (event: 'update:open', value: boolean): void
  (event: 'regenerate'): void
}>()

const handleRegenerate = () => {
  emit('update:open', false)
  emit('regenerate')
}
</script>
