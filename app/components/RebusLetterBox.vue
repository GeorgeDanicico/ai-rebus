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
type LetterState = 'empty' | 'correct' | 'incorrect'

const props = defineProps<{
  modelValue: string
  state: LetterState
  ariaLabel?: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void
  (event: 'advance'): void
  (event: 'back'): void
}>()

const inputRef = ref<HTMLInputElement | null>(null)

const stateClass = computed(() => {
  if (props.state === 'correct') {
    return 'border-emerald-400 bg-emerald-50 text-emerald-700'
  }
  if (props.state === 'incorrect') {
    return 'border-rose-400 bg-rose-50 text-rose-700'
  }
  return 'border-slate-200'
})

const sanitizeValue = (value: string): string => {
  const trimmed = value.replace(/\s+/g, '')
  if (!trimmed) return ''
  const [first] = Array.from(trimmed)
  return first?.toLocaleUpperCase() || '';
}

const handleInput = (event: Event) => {
  if (props.disabled) return
  const target = event.target as HTMLInputElement | null
  if (!target) return
  const nextValue = sanitizeValue(target.value)
  emit('update:modelValue', nextValue)
  if (nextValue) {
    emit('advance')
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  if (props.disabled) return
  // When deleting, clear this box and shift focus back.
  if (event.key === 'Backspace') {
    event.preventDefault()
    emit('update:modelValue', '')
    emit('back')
  }
}

defineExpose({
  focus: () => inputRef.value?.focus(),
})
</script>
