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
          <UButton
            color="neutral"
            variant="ghost"
            class="rounded-full"
            @click="handleSignOut"
          >
            Sign out
          </UButton>
        </div>

        <div class="rounded-3xl border border-dashed border-slate-200 bg-slate-50/80 p-10 text-center">
          <p class="text-sm uppercase tracking-widest text-slate-400">
            Mock Rebus
          </p>
          <p class="mt-3 text-xl font-medium text-slate-800">
            🌧️ + ☔ + 🐈 = ?
          </p>
          <p class="mt-3 text-sm text-slate-500">
            Your AI-generated rebus will appear here once the generator is connected.
          </p>
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

const userLabel = computed(() => user.value?.email ?? 'Guest')

const handleSignOut = async () => {
  await signOut()
  await navigateTo('/')
}
</script>
