import type { Ref } from 'vue'
import { onMounted, ref, watch } from 'vue'

export type RebusResult = {
  words: string[]
  words_questions: string[]
  theme: string
}

export type UseRebus = {
  generated: Ref<RebusResult | null>
  isGenerating: Ref<boolean>
  finished: Ref<boolean>
  generateRebus: (theme?: string) => Promise<RebusResult | null>
  markFinished: () => void
}

export const useRebus = (): UseRebus => {
  const generated = ref<RebusResult | null>(null)
  const isGenerating = ref(false)
  // Tracks whether the current rebus was solved; used to lock inputs and show solutions.
  const finished = ref(false)
  const STORAGE_KEY = 'rebus-session'

  const persist = () => {
    if (!process.client) return
    const payload = JSON.stringify({ generated: generated.value, finished: finished.value })
    localStorage.setItem(STORAGE_KEY, payload)
  }

  const restore = () => {
    if (!process.client) return
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    try {
      const parsed = JSON.parse(raw) as {
        generated: (RebusResult & { theme?: string }) | null
        finished: boolean
      }
      generated.value = parsed.generated
        ? {
            ...parsed.generated,
            theme: parsed.generated.theme ?? '',
          }
        : null
      finished.value = Boolean(parsed.finished)
    } catch (error) {
      console.warn('Failed to restore rebus from storage', error)
    }
  }

  const generateRebus = async (theme?: string) => {
    if (isGenerating.value) return generated.value
    isGenerating.value = true
    try {
      const body = theme ? { theme } : undefined
      const rebus = await $fetch<RebusResult>('/api/v1/rebus/generate', {
        method: 'POST',
        ...(body ? { body } : {}),
      })
      generated.value = rebus
      finished.value = false
      return rebus
    } catch (error) {
      console.error('Failed to generate rebus', error)
      return null
    } finally {
      isGenerating.value = false
    }
  }

  const markFinished = () => {
    finished.value = true
  }

  onMounted(() => {
    restore()
  })

  watch([generated, finished], persist, { deep: true })

  return {
    generated,
    isGenerating,
    finished,
    generateRebus,
    markFinished,
  }
}
