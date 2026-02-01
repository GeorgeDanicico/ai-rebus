<template>
  <div class="flex flex-wrap gap-2">
    <RebusLetterBox
      v-for="(state, index) in letterStates"
      :key="index"
      :ref="(el) => setLetterRef(el, index)"
      :model-value="modelValue[index] ?? ''"
      :state="state"
      :aria-label="`Letter ${index + 1}`"
      :disabled="disabled"
      @update:modelValue="(value) => updateLetter(index, value)"
      @advance="() => focusLetter(index + 1)"
      @back="() => focusLetter(index - 1)"
    />
  </div>
</template>

<script setup lang="ts">
type LetterState = 'empty' | 'correct' | 'incorrect'

type LetterBoxExpose = {
  focus: () => void
}

const props = defineProps<{
  modelValue: string[]
  letterStates: LetterState[]
  disabled?: boolean
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', value: string[]): void
}>()

const letterRefs = ref<Array<LetterBoxExpose | null>>([])

const setLetterRef = (el: LetterBoxExpose | null, index: number) => {
  letterRefs.value[index] = el
}

const focusLetter = (index: number) => {
  if (props.disabled) return
  if (index < 0 || index >= props.letterStates.length) return
  // Keep focus movement within the current word.
  letterRefs.value[index]?.focus()
}

const updateLetter = (index: number, value: string) => {
  const next = props.modelValue.length
    ? [...props.modelValue]
    : Array.from({ length: props.letterStates.length }, () => '')
  next[index] = value
  emit('update:modelValue', next)
}
</script>
