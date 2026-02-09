<template>
  <div class="flex flex-wrap gap-2" @focusin="handleFocusIn">
    <RebusLetterBox
      v-for="(state, index) in letterStates"
      :key="index"
      :ref="(el) => setLetterRef(el, index)"
      :model-value="modelValue[index] ?? ''"
      :state="state"
      :row-focused="isFocused"
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
  isFocused?: boolean
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', value: string[]): void
  (event: 'focused'): void
}>()

const letterRefs = ref<Array<LetterBoxExpose | null>>([])

const setLetterRef = (el: LetterBoxExpose | null, index: number) => {
  letterRefs.value[index] = el
}

const handleFocusIn = () => {
  if (props.disabled) return
  emit('focused')
}

const focusLetter = (index: number) => {
  if (props.disabled) return
  if (index < 0 || index >= props.letterStates.length) return
  // Keep focus movement within the current word.
  letterRefs.value[index]?.focus()
}

const findFirstEmptyIndex = () => {
  for (let index = 0; index < props.letterStates.length; index += 1) {
    if (!(props.modelValue[index] ?? '').trim()) {
      return index
    }
  }
  return -1
}

const focusAt = (index?: number) => {
  if (typeof index === 'number') {
    focusLetter(index)
    return
  }

  const firstEmptyIndex = findFirstEmptyIndex()
  if (firstEmptyIndex >= 0) {
    focusLetter(firstEmptyIndex)
    return
  }

  focusLetter(0)
}

const updateLetter = (index: number, value: string) => {
  const next = props.modelValue.length
    ? [...props.modelValue]
    : Array.from({ length: props.letterStates.length }, () => '')
  next[index] = value
  emit('update:modelValue', next)
}

defineExpose({
  focusAt,
})
</script>
