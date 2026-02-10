export default defineNuxtRouteMiddleware((to) => {
  const { user } = useAuth()

  if (to.path === '/' && user.value) {
    return navigateTo('/rebus')
  }

  if (to.path !== '/' && !user.value) {
    return navigateTo('/')
  }
})
