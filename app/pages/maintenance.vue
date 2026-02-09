<template>
  <UContainer class="relative flex min-h-screen items-center justify-center py-16">
    <div class="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div class="absolute left-1/2 top-[-10%] h-80 w-80 -translate-x-1/2 rounded-full bg-cyan-200/35 blur-3xl" />
      <div class="absolute bottom-[-18%] left-[-8%] h-72 w-72 rounded-full bg-amber-200/35 blur-3xl" />
    </div>

    <UCard class="w-full max-w-2xl border-0 bg-white/85 shadow-2xl ring-1 ring-slate-200/70 backdrop-blur">
      <div class="space-y-8 p-8 text-center sm:p-10">
        <div class="space-y-3">
          <UBadge color="neutral" variant="soft" class="tracking-[0.28em] uppercase">
            System Maintenance
          </UBadge>
          <h1 class="text-4xl font-semibold text-slate-900">
            We are tuning things up
          </h1>
          <p class="mx-auto max-w-xl text-base text-slate-600">
            Rebus Lab is temporarily unavailable while we apply updates and improve reliability.
            Please check back shortly.
          </p>
        </div>

        <div class="loading-zone" role="status" aria-live="polite" aria-label="Maintenance in progress">
          <div class="gear gear-large" aria-hidden="true" />
          <div class="gear gear-small" aria-hidden="true" />
        </div>

        <p class="text-sm text-slate-500">
          Working on it now...
        </p>
      </div>
    </UCard>
  </UContainer>
</template>

<script setup lang="ts">
useHead({
  title: 'Maintenance | Rebus Lab',
})

</script>

<style scoped>
.loading-zone {
  position: relative;
  margin: 0 auto;
  height: 118px;
  width: 168px;
}

.gear {
  position: absolute;
  border-radius: 999px;
  background:
    radial-gradient(circle at center, #f8fafc 0 18px, transparent 19px),
    repeating-conic-gradient(from 0deg, #334155 0 14deg, transparent 14deg 30deg);
  filter: drop-shadow(0 14px 24px rgba(15, 23, 42, 0.12));
}

.gear::after {
  content: '';
  position: absolute;
  inset: 27%;
  border-radius: 999px;
  border: 4px solid rgba(148, 163, 184, 0.55);
  background: #f8fafc;
}

.gear-large {
  left: 10px;
  top: 18px;
  height: 86px;
  width: 86px;
  animation: spin-clockwise 1.8s linear infinite;
}

.gear-small {
  right: 12px;
  top: 50px;
  height: 58px;
  width: 58px;
  animation: spin-counter 1.25s linear infinite;
}

@keyframes spin-clockwise {
  to {
    transform: rotate(360deg);
  }
}

@keyframes spin-counter {
  to {
    transform: rotate(-360deg);
  }
}
</style>
