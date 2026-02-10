<template>
  <input
    ref="inputRef"
    class="size-12 rounded-xl border bg-white text-center text-lg font-semibold uppercase text-slate-700 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-slate-300/70 sm:size-14"
    :class="stateClass"
    :value="modelValue"
    inputmode="text"
    maxlength="1"
    autocomplete="off"
    spellcheck="false"
    :aria-label="ariaLabel"
    :disabled="disabled"
    @input="handleInput"
    @keydown="handleKeydown"
  />
</template>

<script setup lang="ts">
import type { LetterState } from '../types/rebus'

const props = defineProps<{
  modelValue: string
  state: LetterState
  ariaLabel?: string
  disabled?: boolean
  rowFocused?: boolean
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void
  (event: 'advance' | 'back'): void
}>()

const inputRef = ref<HTMLInputElement | null>(null)

const stateClass = computed(() => {
  const rowFocusClass = props.rowFocused
    ? 'ring-1 ring-slate-300/80 shadow-[inset_0_0_0_999px_rgba(148,163,184,0.08)]'
    : ''

  if (props.state === 'correct') {
    return ['border-emerald-400 bg-emerald-50 text-emerald-700', rowFocusClass]
      .filter(Boolean)
      .join(' ')
  }
  if (props.state === 'incorrect') {
    return ['border-rose-400 bg-rose-50 text-rose-700', rowFocusClass]
      .filter(Boolean)
      .join(' ')
  }
  if (props.rowFocused) {
    return 'border-slate-300 bg-slate-50 text-slate-700 ring-1 ring-slate-300/80'
  }
  return 'border-slate-200'
})

const sanitizeValue = (value: string): string => {
  const trimmed = value.replace(/\s+/g, '')
  if (!trimmed) return ''
  const [first] = Array.from(trimmed)
  return first?.toLocaleUpperCase() || ''
}

const commitValue = (value: string) => {
  emit('update:modelValue', value)
  if (value) {
    emit('advance')
  }
}

const handleInput = (event: Event) => {
  if (props.disabled) return
  const target = event.target as HTMLInputElement | null
  if (!target) return
  const nextValue = sanitizeValue(target.value)
  target.value = nextValue
  commitValue(nextValue)
}

const handleKeydown = (event: KeyboardEvent) => {
  if (props.disabled) return

  if (event.key === 'Backspace') {
    event.preventDefault()
    emit('update:modelValue', '')
    emit('back')
    return
  }

  if (event.metaKey || event.ctrlKey || event.altKey || event.key.length !== 1) return

  const nextValue = sanitizeValue(event.key)
  if (!nextValue) return

  event.preventDefault()
  commitValue(nextValue)
}

defineExpose({
  focus: () => inputRef.value?.focus(),
})
</script>
