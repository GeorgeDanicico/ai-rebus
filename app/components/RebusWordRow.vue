<template>
  <div class="flex flex-wrap gap-2">
    <RebusLetterBox
      v-for="(state, index) in letterStates"
      :key="index"
      :model-value="modelValue[index] ?? ''"
      :state="state"
      :aria-label="`Letter ${index + 1}`"
      :disabled="disabled"
      @update:modelValue="(value) => updateLetter(index, value)"
    />
  </div>
</template>

<script setup lang="ts">
type LetterState = 'empty' | 'correct' | 'incorrect'

const props = defineProps<{
  modelValue: string[]
  letterStates: LetterState[]
  disabled?: boolean
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', value: string[]): void
}>()

const updateLetter = (index: number, value: string) => {
  const next = props.modelValue.length
    ? [...props.modelValue]
    : Array.from({ length: props.letterStates.length }, () => '')
  next[index] = value
  emit('update:modelValue', next)
}
</script>
