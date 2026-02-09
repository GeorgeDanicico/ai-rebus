<template>
  <div class="space-y-3">
    <p class="text-sm font-medium uppercase tracking-[0.2em] text-slate-400">
      Questions
    </p>
    <ol class="space-y-2 text-sm text-slate-600">
      <li v-for="(question, index) in questions" :key="`${index}-${question}`">
        <button
          type="button"
          class="group inline-flex w-full items-start gap-2 rounded-lg px-2 py-1 text-left transition hover:bg-slate-100/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300/80 disabled:cursor-not-allowed disabled:opacity-70"
          :disabled="disabled"
          :aria-label="`Focus word ${index + 1}`"
          @click="emit('select', index)"
        >
          <span class="font-medium text-slate-700">{{ index + 1 }}.</span>
          <span class="text-slate-600 group-hover:text-slate-700">{{ question }}</span>
        </button>
      </li>
    </ol>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  questions: string[]
  disabled?: boolean
}>()

const emit = defineEmits<{
  (event: 'select', index: number): void
}>()
</script>
