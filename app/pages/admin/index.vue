<template>
  <UContainer class="flex min-h-screen items-center justify-center py-16">
    <UCard class="w-full max-w-4xl border-0 bg-white/90 shadow-xl ring-1 ring-slate-200/70">
      <div class="space-y-6 p-8 sm:p-10">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p class="text-xs uppercase tracking-[0.3em] text-slate-400">
              Admin
            </p>
            <h1 class="mt-2 text-3xl font-semibold text-slate-900">
              Access requests
            </h1>
            <p class="text-sm text-slate-500">
              Pending users waiting for approval.
            </p>
          </div>
          <div class="flex items-center gap-2">
            <UButton color="neutral" variant="soft" class="rounded-full" @click="refresh">
              Refresh
            </UButton>
            <UButton color="neutral" variant="ghost" class="rounded-full" @click="goBack">
              Back to rebus
            </UButton>
          </div>
        </div>

        <div v-if="pending" class="rounded-2xl border border-slate-200/70 bg-white/70 p-6">
          <p class="text-sm text-slate-500">Loading access requests...</p>
        </div>

        <UAlert v-else-if="error" color="rose" variant="soft">
          <template #description>
            Failed to load access requests. Please try again.
          </template>
        </UAlert>

        <UAlert v-else-if="requests.length === 0" color="neutral" variant="soft">
          <template #description>
            No pending requests right now.
          </template>
        </UAlert>

        <ul v-else class="space-y-3">
          <li
            v-for="request in requests"
            :key="request.id"
            class="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/70 bg-white/70 px-5 py-4"
          >
            <div>
              <p class="text-base font-medium text-slate-900">
                {{ formatName(request) }}
              </p>
              <p class="text-xs text-slate-500">
                Profile ID: {{ request.id }}
              </p>
            </div>
            <UBadge color="amber" variant="soft" class="rounded-full">
              Pending
            </UBadge>
          </li>
        </ul>
      </div>
    </UCard>
  </UContainer>
</template>

<script setup lang="ts">
import type { Tables } from '~/types/database.types'

definePageMeta({
  middleware: ['auth', 'admin'],
})

type AccessRequest = Pick<
  Tables<'profiles'>,
  'id' | 'first_name' | 'last_name' | 'allowed' | 'role'
>

const { data, pending, error, refresh } = await useFetch<AccessRequest[]>(
  '/api/v1/admin/requests'
)

const requests = computed(() => data.value ?? [])

const formatName = (request: AccessRequest) => {
  const first = request.first_name?.trim() ?? ''
  const last = request.last_name?.trim() ?? ''
  const full = [first, last].filter(Boolean).join(' ')
  return full || 'Unnamed user'
}

const goBack = async () => {
  await navigateTo('/rebus')
}
</script>
