import type { Tables } from '~/types/database.types'

export const useProfile = () => {
  const user = useSupabaseUser()

  const profile = useState<Tables<'profiles'> | null>('profile', () => null)
  const isLoading = useState('profile-loading', () => false)
  const error = useState<string | null>('profile-error', () => null)

  const fetchProfile = async () => {
    if (!user.value) {
      profile.value = null
      return null
    }

    isLoading.value = true
    error.value = null

    const data = await $fetch<Tables<'profiles'> | null>('/api/v1/profile')

    profile.value = data
    isLoading.value = false
    return data
  }

  const fetchWithErrorHandling = async () => {
    try {
      return await fetchProfile()
    } catch (fetchError) {
      error.value =
        fetchError instanceof Error ? fetchError.message : 'Failed to load profile.'
      profile.value = null
      isLoading.value = false
      return null
    }
  }

  watchEffect(() => {
    if (user.value) {
      void fetchWithErrorHandling()
    } else {
      profile.value = null
    }
  })

  return {
    profile,
    isLoading,
    error,
    fetchProfile,
  }
}
