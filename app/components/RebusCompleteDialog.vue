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
            Round Complete
          </p>
          <p class="text-sm text-slate-500">
            You guessed every word correctly. Want another themed round?
          </p>
          <p class="text-sm text-slate-600">
            Theme: <span class="font-medium text-slate-800">{{ resolvedTheme }}</span>
          </p>
        </div>
        <div class="flex flex-wrap justify-end gap-3">
          <UButton color="primary" variant="solid" class="rounded-full" @click="handleRegenerate">
            Generate another round
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
const props = defineProps<{
  open: boolean
  theme?: string
}>()

const emit = defineEmits<{
  (event: 'update:open', value: boolean): void
  (event: 'regenerate'): void
}>()

const resolvedTheme = computed(() => {
  const value = props.theme?.trim()
  return value || 'Unknown'
})

const handleRegenerate = () => {
  emit('update:open', false)
  emit('regenerate')
}
</script>
