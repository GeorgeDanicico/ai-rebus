<template>
  <div class="space-y-6">
    <div v-if="!finished" class="space-y-3">
      <RebusWordRow
        v-for="(word, wordIndex) in words"
        :key="`${wordIndex}-${word}`"
        :ref="(el) => setWordRowRef(el, wordIndex)"
        :model-value="inputs[wordIndex] ?? []"
        :letter-states="letterStates[wordIndex] ?? []"
        :is-focused="!(disabled || finished) && activeRowIndex === wordIndex"
        :disabled="disabled || finished"
        @update:modelValue="(value) => updateWord(wordIndex, value)"
        @focused="() => setActiveRow(wordIndex)"
      />
    </div>

    <RebusQuestions
      v-if="displayQuestions.length"
      :questions="displayQuestions"
      :disabled="disabled || finished"
      @select="focusWordRow"
    />

    <div v-if="finished" class="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3 text-sm text-slate-700">
      <p class="font-semibold text-slate-900">Solved words</p>
      <ul class="mt-1 list-disc pl-5">
        <li v-for="(word, index) in words" :key="`${word}-${index}`">{{ word }}</li>
      </ul>
    </div>

    <RebusCompleteDialog
      v-if="isDialogOpen"
      v-model:open="isDialogOpen"
      @regenerate="emit('regenerate')"
    />
  </div>
</template>

<script setup lang="ts">
import type { LetterState } from '../types/rebus'
import { getWordLetterStates, isWordSolved, splitWord } from '../utils/rebus'

type WordRowExpose = {
  focusAt: (index?: number) => void
}

const props = defineProps<{
  words: string[]
  questions: string[]
  disabled?: boolean
  finished?: boolean
}>()

const emit = defineEmits<{
  (event: 'regenerate' | 'finished'): void
}>()

const inputs = ref<string[][]>([])
const wordRowRefs = ref<Array<WordRowExpose | null>>([])
const activeRowIndex = ref<number | null>(null)
const isDialogOpen = ref(false)

const wordLetters = computed(() => props.words.map(splitWord))

const displayQuestions = computed(() => {
  if (!props.words.length) return []
  const fallback = props.words.map((_, index) => `Word ${index + 1}`)
  if (!props.questions.length) return fallback
  return props.words.map((_, index) => props.questions[index] ?? fallback[index])
})

const letterStates = computed<LetterState[][]>(() =>
  wordLetters.value.map((letters, wordIndex) =>
    getWordLetterStates(letters, inputs.value[wordIndex] ?? [])
  )
)

const isSolved = computed(() => {
  if (!wordLetters.value.length) return false
  return wordLetters.value.every((letters, wordIndex) =>
    isWordSolved(letters, inputs.value[wordIndex] ?? [])
  )
})

const resetInputs = () => {
  inputs.value = props.words.map((word) => splitWord(word).map(() => ''))
}

const isRowSolved = (wordIndex: number, rowInput = inputs.value[wordIndex] ?? []) => {
  const letters = wordLetters.value[wordIndex]
  if (!letters?.length) return false
  return isWordSolved(letters, rowInput)
}

const findNextUnsolvedRowIndex = (wordIndex: number) => {
  for (let nextIndex = wordIndex + 1; nextIndex < wordLetters.value.length; nextIndex += 1) {
    if (!isRowSolved(nextIndex)) {
      return nextIndex
    }
  }
  return null
}

const focusNextUnsolvedRow = async (wordIndex: number) => {
  if (props.disabled || props.finished) return

  const nextRowIndex = findNextUnsolvedRowIndex(wordIndex)
  if (nextRowIndex === null) return

  await nextTick()
  focusWordRow(nextRowIndex)
}

const updateWord = (wordIndex: number, next: string[]) => {
  const wasSolved = isRowSolved(wordIndex)

  const updated = [...inputs.value]
  updated[wordIndex] = next
  inputs.value = updated

  const isNowSolved = isRowSolved(wordIndex, next)
  // Continue naturally to the next unsolved row once this row is completed.
  if (!wasSolved && isNowSolved) {
    void focusNextUnsolvedRow(wordIndex)
  }
}

const setWordRowRef = (el: WordRowExpose | null, index: number) => {
  wordRowRefs.value[index] = el
}

const setActiveRow = (wordIndex: number | null) => {
  if (wordIndex === null) {
    activeRowIndex.value = null
    return
  }
  if (wordIndex < 0 || wordIndex >= props.words.length) return
  activeRowIndex.value = wordIndex
}

const focusWordRow = (wordIndex: number) => {
  if (props.disabled || props.finished) return
  setActiveRow(wordIndex)
  wordRowRefs.value[wordIndex]?.focusAt()
}

watch(
  () => props.words,
  () => {
    resetInputs()
    wordRowRefs.value = []
    setActiveRow(null)
    isDialogOpen.value = false
  },
  { immediate: true }
)

watch(
  isSolved,
  (value, previous) => {
    if (!value || previous) return
    isDialogOpen.value = true
    if (!props.finished) {
      emit('finished')
    }
  }
)
</script>
