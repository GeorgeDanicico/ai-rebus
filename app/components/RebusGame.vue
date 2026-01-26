<template>
  <div class="space-y-6">
    <div class="space-y-3">
      <RebusWordRow
        v-for="(word, wordIndex) in words"
        :key="`${wordIndex}-${word}`"
        :model-value="inputs[wordIndex] ?? []"
        :letter-states="letterStates[wordIndex] ?? []"
        :disabled="disabled"
        @update:modelValue="(value) => updateWord(wordIndex, value)"
      />
    </div>

    <RebusQuestions v-if="displayQuestions.length" :questions="displayQuestions" />

    <RebusCompleteDialog
      v-model:open="isDialogOpen"
      @regenerate="emit('regenerate')"
    />
  </div>
</template>

<script setup lang="ts">
type LetterState = 'empty' | 'correct' | 'incorrect'

const props = defineProps<{
  words: string[]
  questions: string[]
  disabled?: boolean
}>()

const emit = defineEmits<{
  (event: 'regenerate'): void
}>()

const inputs = ref<string[][]>([])
const isDialogOpen = ref(false)

const splitWord = (word: string) => Array.from(word)

const normalizeLetter = (value: string) =>
  value.normalize('NFC').trim().slice(0, 1).toLocaleUpperCase()

const wordLetters = computed(() => props.words.map(splitWord))

const displayQuestions = computed(() => {
  if (!props.words.length) return []
  const fallback = props.words.map((_, index) => `Word ${index + 1}`)
  if (!props.questions.length) return fallback
  return props.words.map((_, index) => props.questions[index] ?? fallback[index])
})

const letterStates = computed<LetterState[][]>(() =>
  wordLetters.value.map((letters, wordIndex) =>
    letters.map((letter, letterIndex) => {
      const input = inputs.value[wordIndex]?.[letterIndex] ?? ''
      if (!input) return 'empty'
      return normalizeLetter(input) === normalizeLetter(letter) ? 'correct' : 'incorrect'
    })
  )
)

const isSolved = computed(() => {
  if (!wordLetters.value.length) return false
  return wordLetters.value.every((letters, wordIndex) =>
    letters.every(
      (letter, letterIndex) =>
        normalizeLetter(inputs.value[wordIndex]?.[letterIndex] ?? '') ===
        normalizeLetter(letter)
    )
  )
})

const resetInputs = () => {
  inputs.value = props.words.map((word) => splitWord(word).map(() => ''))
}

const updateWord = (wordIndex: number, next: string[]) => {
  const updated = [...inputs.value]
  updated[wordIndex] = next
  inputs.value = updated
}

watch(
  () => props.words,
  () => {
    resetInputs()
    isDialogOpen.value = false
  },
  { immediate: true }
)

watch(
  isSolved,
  (value, previous) => {
    if (value && !previous) {
      isDialogOpen.value = true
    }
  }
)
</script>
