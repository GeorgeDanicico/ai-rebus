import type { Database, Tables } from '~/types/database.types'

//TODO move the profile fetching logic to the 
export const useProfile = () => {
  const supabase = useSupabaseClient<Database>()
  const user = useSupabaseUser()

  const profile = ref<Tables<'profiles'> | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const fetchProfile = async () => {
    if (!user.value) {
      profile.value = null
      return null
    }

    isLoading.value = true
    error.value = null

    const { data, error: queryError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, tokens')
      .eq('id', user.value.sub)
      .maybeSingle()

    if (queryError) {
      error.value = queryError.message
      profile.value = null
      isLoading.value = false
      return null
    }

    profile.value = data
    isLoading.value = false
    return data
  }

  watchEffect(() => {
    if (user.value) {
      void fetchProfile()
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
