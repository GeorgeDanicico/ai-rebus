<template>
  <UContainer class="relative flex min-h-screen items-center justify-center py-16">
    <div class="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div class="absolute left-1/2 top-[-12%] h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-200/40 blur-3xl" />
      <div class="absolute bottom-[-18%] right-[-8%] h-72 w-72 rounded-full bg-amber-200/40 blur-3xl" />
    </div>

    <UCard
      class="landing-card w-full max-w-4xl border-0 bg-white/80 shadow-2xl ring-1 ring-slate-200/70 backdrop-blur"
    >
      <div class="space-y-10 p-8 sm:p-12">
        <div class="space-y-4">
          <UBadge color="primary" variant="soft" class="tracking-[0.3em] uppercase">
            Rebus Lab
          </UBadge>
          <h1 class="text-4xl font-semibold text-slate-900 sm:text-5xl">
            Decode the clue.
            <span class="bg-gradient-to-r from-slate-900 via-slate-700 to-slate-500 bg-clip-text text-transparent">
              See the idea.
            </span>
          </h1>
          <p class="max-w-2xl text-lg text-slate-600">
            A rebus is a picture riddle. We use AI to generate clever rebuses so you can guess, share, and learn fast.
          </p>
        </div>

        <div class="flex flex-col gap-4 sm:flex-row sm:items-center">
          <UButton
            type="button"
            color="neutral"
            variant="solid"
            size="lg"
            class="group w-full rounded-full bg-white px-6 py-3 text-base font-medium text-slate-900 shadow-lg shadow-slate-200/80 ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:bg-slate-50 sm:w-auto"
            aria-label="Continue with Google"
            :loading="isSigningIn"
            @click="handleGoogleLogin"
          >
            <span class="flex items-center gap-3">
              <span class="grid size-9 place-items-center rounded-full bg-white shadow-sm ring-1 ring-slate-200">
                <img
                  src="https://www.gstatic.com/images/branding/product/1x/googleg_48dp.png"
                  alt=""
                  class="size-5"
                  aria-hidden="true"
                />
              </span>
              <span>Continue with Google</span>
            </span>
          </UButton>
          <p class="text-sm text-slate-500">
            One tap to start. No credit card, no noise.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-3 text-xs text-slate-400">
          <span
            v-for="tag in tags"
            :key="tag"
            class="rounded-full border border-slate-200/70 bg-white/70 px-3 py-1"
          >
            {{ tag }}
          </span>
        </div>
      </div>
    </UCard>
  </UContainer>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

const { signInWithGoogle } = useAuth()
const isSigningIn = ref(false)

const handleGoogleLogin = async () => {
  if (isSigningIn.value) return
  isSigningIn.value = true
  try {
    await signInWithGoogle()
  } catch (error) {
    console.error('Google sign-in failed', error)
    isSigningIn.value = false
  }
}

const features = [
  {
    kicker: 'Generate',
    title: 'Fresh rebuses on demand',
    description: 'Prompt a theme and get puzzles designed for quick guesses.',
  },
  {
    kicker: 'Guess',
    title: 'Play solo or with friends',
    description: 'Share a link and see who solves it first.',
  },
  {
    kicker: 'Learn',
    title: 'Build a visual memory',
    description: 'Every rebus teaches a new way to connect ideas.',
  },
]

const tags = ['AI generated rebuses', 'Shareable puzzles', 'Daily practice', 'Adaptive difficulty']
</script>

<style scoped>
.landing-card {
  background-image: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7));
}
</style>
