<template>
  <UContainer class="flex min-h-screen items-center justify-center py-16">
    <UCard class="w-full max-w-3xl border-0 bg-white/85 shadow-xl ring-1 ring-slate-200/70">
      <div class="space-y-6 p-8 sm:p-10">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p class="text-xs uppercase tracking-[0.3em] text-slate-400">
              Your Round
            </p>
            <h1 class="mt-2 text-3xl font-semibold text-slate-900">
              Guess the themed words
            </h1>
          </div>
          <div class="flex items-center gap-3">
            <UBadge color="primary" variant="soft" class="rounded-full">
              Tokens: {{ tokensLabel }}
            </UBadge>
            <UButton
              v-if="isAdmin"
              color="primary"
              variant="soft"
              class="rounded-full"
              @click="goToAdmin"
            >
              Admin dashboard
            </UButton>
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
          <div
            v-if="canGenerate"
            class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p class="text-base font-medium text-slate-900">
                Ready for a new themed round?
              </p>
              <p class="text-sm text-slate-500">
                We&rsquo;ll generate fresh theme-based words with clues for you to solve.
              </p>
            </div>
            <UButton
              color="primary"
              variant="solid"
              size="lg"
              class="rounded-full"
              :loading="isGenerating"
              :disabled="!canGenerate"
              @click="handleGenerate"
            >
              Generate round
            </UButton>
          </div>

          <div v-if="generationBlockedReason">
            <UAlert color="neutral" variant="soft">
              <template #description>
                <template v-if="generationBlockedReason === 'no-tokens'">
                  You can&apos;t generate a new round right now. Tokens reset in:
                  <span class="font-semibold text-slate-700">{{ timeRemaining }}</span>
                  <span class="ml-1 text-slate-500">(UTC 00:00)</span>
                </template>
                <template v-else>
                  You can&apos;t currently generate a new round.
                </template>
              </template>
            </UAlert>
          </div>

          <div v-if="canGenerate && generated" class="mt-6">
            <RebusGame
              :words="generated.words"
              :questions="generated.words_questions"
              :theme="generated.theme"
              :disabled="isGenerating"
              :finished="finished"
              @regenerate="handleGenerate"
              @finished="markFinished"
            />
          </div>
        </div>

        <div class="flex flex-col gap-2 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>Signed in as {{ userLabel }}</span>
          <span>Hint: Start from the theme and narrow down each guess.</span>
        </div>
      </div>
    </UCard>
  </UContainer>

  <UModal
    :open="isAccessGrantedOpen"
    :dismissible="false"
    @update:open="(value) => (isAccessGrantedOpen = value)"
    title="Access granted"
    description=""
  >
    <template #body>
      <div class="space-y-4 p-6">
        <div class="space-y-2">
          <p class="text-xs uppercase tracking-[0.3em] text-slate-400">
            Welcome
          </p>
          <p class="text-sm text-slate-500">
            You&#39;ve been granted access. Enjoy the app!
          </p>
        </div>
        <div class="flex flex-wrap justify-end gap-3">
          <UButton color="primary" variant="solid" class="rounded-full" @click="dismissAccessGranted">
            Continue
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

const { user, signOut } = useAuth()
const { profile, isLoading: isProfileLoading, fetchProfile } = useProfile()
const { generated, isGenerating, finished, generateRebus, markFinished } = useRebus()
const { timeRemaining } = useUtcResetCountdown()

const isAllowedToGenerate = computed(() => profile.value?.allowed === true)
const tokensRemaining = computed(() => profile.value?.tokens ?? 0)
const canGenerate = computed(
  () => isAllowedToGenerate.value && tokensRemaining.value > 0
)
const generationBlockedReason = computed<'no-tokens' | 'not-allowed' | null>(() => {
  if (isProfileLoading.value) return null
  if (!isAllowedToGenerate.value) return 'not-allowed'
  if (tokensRemaining.value <= 0) return 'no-tokens'
  return null
})
const isAdmin = computed(() => profile.value?.role === 'ADMIN')
const isAccessGrantedOpen = ref(false)
const isAcknowledgingAccess = ref(false)
const hasAcknowledgedAccess = ref(false)

const userLabel = computed(() => user.value?.email ?? 'Guest')
const tokensLabel = computed(() => {
  if (isProfileLoading.value) return '...'
  return tokensRemaining.value
})

const handleGenerate = async () => {
  if (!canGenerate.value) return
  await generateRebus()
  await fetchProfile()
}

const handleSignOut = async () => {
  await signOut()
  await navigateTo('/')
}

const goToAdmin = async () => {
  await navigateTo('/admin')
}

const acknowledgeAccess = async () => {
  if (isAcknowledgingAccess.value) return
  isAcknowledgingAccess.value = true
  try {
    await $fetch('/api/v1/profile/ack-approval', { method: 'POST' })
    await fetchProfile()
  } catch (error) {
    console.error('Failed to acknowledge access approval', error)
    hasAcknowledgedAccess.value = false
  } finally {
    isAcknowledgingAccess.value = false
  }
}

const dismissAccessGranted = () => {
  isAccessGrantedOpen.value = false
}

watchEffect(() => {
  if (isProfileLoading.value) return
  if (!profile.value?.allowed) return
  if (profile.value.received_initial_approval_confirmation !== false) return

  if (!isAccessGrantedOpen.value) {
    isAccessGrantedOpen.value = true
  }

  if (!hasAcknowledgedAccess.value) {
    hasAcknowledgedAccess.value = true
    void acknowledgeAccess()
  }
})
</script>
