<template>
  <li class="rounded-2xl border border-slate-200/70 bg-white/70">
    <div class="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
      <div>
        <p class="text-base font-medium text-slate-900">
          {{ fullName }}
        </p>
        <p class="text-xs text-slate-500">
          Profile ID: {{ request.id }}
        </p>
      </div>

      <div class="flex items-center gap-2">
        <UButton
          color="primary"
          variant="soft"
          size="sm"
          class="rounded-full"
          :loading="isApproving"
          :disabled="isApproving"
          @click="handleApprove"
        >
          Approve
        </UButton>
      </div>
    </div>
  </li>
</template>

<script setup lang="ts">
import type { Tables } from '~/types/database.types'

type AccessRequest = Pick<
  Tables<'profiles'>,
  'id' | 'first_name' | 'last_name' | 'allowed' | 'role'
>

const props = defineProps<{
  request: AccessRequest
}>()

const emit = defineEmits<{
  (event: 'approved', id: string): void
  (event: 'error', message: string): void
}>()

const isApproving = ref(false)

const fullName = computed(() => {
  const first = props.request.first_name?.trim() ?? ''
  const last = props.request.last_name?.trim() ?? ''
  const combined = [first, last].filter(Boolean).join(' ')
  return combined || 'Unnamed user'
})

const handleApprove = async () => {
  if (isApproving.value) return

  isApproving.value = true
  try {
    await $fetch('/api/v1/admin/approve', {
      method: 'POST',
      body: { id: props.request.id },
    })
    emit('approved', props.request.id)
  } catch (error) {
    console.error('Failed to approve access request', error)
    emit('error', 'Failed to approve this user. Please try again.')
  } finally {
    isApproving.value = false
  }
}
</script>
