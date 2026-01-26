<template>
  <input
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
}>()

const stateClass = computed(() => {
  if (props.state === 'correct') {
    return 'border-emerald-400 bg-emerald-50 text-emerald-700'
  }
  if (props.state === 'incorrect') {
    return 'border-rose-400 bg-rose-50 text-rose-700'
  }
  return 'border-slate-200'
})

const sanitizeValue = (value: string) => {
  const trimmed = value.replace(/\s+/g, '')
  if (!trimmed) return ''
  const [first] = Array.from(trimmed)
  return first.toLocaleUpperCase()
}

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement | null
  if (!target) return
  emit('update:modelValue', sanitizeValue(target.value))
}
</script>
