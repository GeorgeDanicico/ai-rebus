export default defineNuxtRouteMiddleware(async () => {
  const { profile, fetchProfile } = useProfile()

  if (!profile.value) {
    try {
      await fetchProfile()
    } catch (error) {
      console.error('Failed to load profile for admin check', error)
    }
  }

  if (profile.value?.role !== 'ADMIN') {
    return navigateTo('/rebus')
  }
})
