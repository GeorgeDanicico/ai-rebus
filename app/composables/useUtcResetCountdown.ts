import type { Ref } from 'vue'
import { onUnmounted, ref } from 'vue'

export type UtcResetCountdown = {
  timeRemaining: Ref<string>
  nextReset: Ref<Date>
}

const formatDuration = (ms: number) => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    seconds.toString().padStart(2, '0'),
  ].join(':')
}

const getNextUtcMidnight = (now: Date) => {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0))
}

export const useUtcResetCountdown = (): UtcResetCountdown => {
  const timeRemaining = ref('00:00:00')
  const nextReset = ref(getNextUtcMidnight(new Date()))

  const update = () => {
    const now = new Date()
    const next = getNextUtcMidnight(now)
    nextReset.value = next
    timeRemaining.value = formatDuration(next.getTime() - now.getTime())
  }

  let timer: ReturnType<typeof setInterval> | null = null

  update()

  if (process.client) {
    timer = setInterval(update, 1000)

    onUnmounted(() => {
      if (timer) {
        clearInterval(timer)
        timer = null
      }
    })
  }

  return {
    timeRemaining,
    nextReset,
  }
}
