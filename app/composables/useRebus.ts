import type { Ref } from 'vue'

export type RebusResult = {
  words: string[]
  words_questions: string[]
}

export type UseRebus = {
  generated: Ref<RebusResult | null>
  isGenerating: Ref<boolean>
  generateRebus: (theme?: string) => Promise<RebusResult | null>
}

export const useRebus = (): UseRebus => {
  const generated = ref<RebusResult | null>(null)
  const isGenerating = ref(false)

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
      return rebus
    } catch (error) {
      console.error('Failed to generate rebus', error)
      return null
    } finally {
      isGenerating.value = false
    }
  }

  return {
    generated,
    isGenerating,
    generateRebus,
  }
}
