<template>
  <UContainer class="flex min-h-screen items-center justify-center py-16">
    <UCard class="w-full max-w-md border-0 bg-white/90 shadow-xl ring-1 ring-slate-200/70">
      <div class="space-y-4 p-8 text-center">
        <div class="flex items-center justify-center">
          <span class="spinner" aria-hidden="true" />
        </div>
        <h1 class="text-2xl font-semibold text-slate-900">
          Confirming your sign-in
        </h1>
        <p class="text-sm text-slate-600">
          Hang tight while we connect your account. You will be redirected shortly.
        </p>
      </div>
    </UCard>
  </UContainer>
</template>

<script setup lang="ts">
const { user } = useAuth();

watchEffect(() => {
  if (user.value) navigateTo('/rebus')
})
</script>

<style scoped>
.spinner {
  height: 44px;
  width: 44px;
  border-radius: 999px;
  border: 4px solid rgba(148, 163, 184, 0.35);
  border-top-color: rgba(15, 23, 42, 0.8);
  animation: spin 0.9s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
