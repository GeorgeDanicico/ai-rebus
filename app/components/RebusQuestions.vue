<template>
  <div class="space-y-3">
    <p class="text-sm font-medium uppercase tracking-[0.2em] text-slate-400">
      Questions
    </p>
    <ol class="space-y-2 text-sm text-slate-600">
      <li v-for="(question, index) in questions" :key="`${index}-${question}`">
        <span class="font-medium text-slate-700">{{ index + 1 }}.</span>
        {{ question }}
      </li>
    </ol>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  questions: string[]
}>()
</script>
