<template>
  <UContainer class="flex min-h-screen items-center justify-center py-16">
    <UCard class="w-full max-w-3xl border-0 bg-white/85 shadow-xl ring-1 ring-slate-200/70">
      <div class="space-y-6 p-8 sm:p-10">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p class="text-xs uppercase tracking-[0.3em] text-slate-400">
              Your Rebus
            </p>
            <h1 class="mt-2 text-3xl font-semibold text-slate-900">
              Decode the story in pictures
            </h1>
          </div>
          <div class="flex items-center gap-3">
            <UBadge color="primary" variant="soft" class="rounded-full">
              Tokens: {{ tokensLabel }}
            </UBadge>
            <UButton
              color="neutral"
              variant="ghost"
              class="rounded-full"
              @click="handleSignOut"
            >
              Sign out
            </UButton>
          </div>
        </div>

        <div class="rounded-3xl border border-slate-200/70 bg-white/70 p-6">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p class="text-base font-medium text-slate-900">
                Ready to generate your rebus?
              </p>
              <p class="text-sm text-slate-500">
                We’ll craft a fresh word set you can turn into a rebus puzzle.
              </p>
            </div>
            <UButton
              color="primary"
              variant="solid"
              size="lg"
              class="rounded-full"
              :loading="isGenerating"
              @click="handleGenerate"
            >
              Generate rebus
            </UButton>
          </div>

          <div v-if="generated" class="mt-6 space-y-3">
            <div class="flex flex-wrap gap-2">
              <UBadge
                v-for="word in generated.words"
                :key="word"
                color="primary"
                variant="soft"
                class="rounded-full"
              >
                {{ word }}
              </UBadge>
            </div>
            <p class="text-sm text-slate-500">
              Answer: <span class="font-medium text-slate-700">{{ generated.answer }}</span>
            </p>
            <p v-if="generated.hint" class="text-sm text-slate-400">
              Hint: {{ generated.hint }}
            </p>
          </div>
        </div>

        <div class="flex flex-col gap-2 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>Signed in as {{ userLabel }}</span>
          <span>Hint: Think about a familiar phrase.</span>
        </div>
      </div>
    </UCard>
  </UContainer>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

const { user, signOut } = useAuth()
const { profile, isLoading: isProfileLoading } = useProfile()

const userLabel = computed(() => user.value?.email ?? 'Guest')
const tokensLabel = computed(() => {
  if (isProfileLoading.value) return '...'
  return profile.value?.tokens ?? 0
})

const isGenerating = ref(false)
const generated = ref<{ words: string[]; answer: string; hint?: string } | null>(null)

const handleGenerate = async () => {
  if (isGenerating.value) return
  isGenerating.value = true
  try {
    generated.value = await $fetch('/api/v1/rebus/generate', { method: 'POST' })
  } catch (error) {
    console.error('Failed to generate rebus', error)
  } finally {
    isGenerating.value = false
  }
}

const handleSignOut = async () => {
  await signOut()
  await navigateTo('/')
}
</script>
