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

        <div v-else class="space-y-3">
          <UAlert v-if="actionError" color="rose" variant="soft">
            <template #description>
              {{ actionError }}
            </template>
          </UAlert>

          <ul class="space-y-3">
            <AdminAccessRequestItem
              v-for="request in requests"
              :key="request.id"
              :request="request"
              @approved="handleApproved"
              @error="handleError"
            />
          </ul>
        </div>
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
const actionError = ref<string | null>(null)

const handleApproved = (requestId: string) => {
  actionError.value = null
  if (data.value) {
    data.value = data.value.filter((request) => request.id !== requestId)
  }
}

const handleError = (message: string) => {
  actionError.value = message
}

const goBack = async () => {
  await navigateTo('/rebus')
}
</script>
