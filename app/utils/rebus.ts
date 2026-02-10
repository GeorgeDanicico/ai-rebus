import type { LetterState } from '../types/rebus'

export const splitWord = (word: string): string[] => Array.from(word)

export const normalizeLetter = (value: string): string =>
  value.normalize('NFC').trim().slice(0, 1).toLocaleUpperCase()

export const getWordLetterStates = (
  wordLetters: string[],
  inputLetters: string[]
): LetterState[] =>
  wordLetters.map((letter, letterIndex) => {
    const input = inputLetters[letterIndex] ?? ''
    if (!input) return 'empty'
    return normalizeLetter(input) === normalizeLetter(letter) ? 'correct' : 'incorrect'
  })

export const isWordSolved = (wordLetters: string[], inputLetters: string[]): boolean =>
  wordLetters.every(
    (letter, letterIndex) =>
      normalizeLetter(inputLetters[letterIndex] ?? '') === normalizeLetter(letter)
  )
