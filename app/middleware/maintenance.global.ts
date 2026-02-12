export default defineNuxtRouteMiddleware((to) => {
  const config = useRuntimeConfig()
  const isMaintenance = config.public.maintenanceMode === 'true';

  if (isMaintenance && to.path !== '/maintenance') {
    return navigateTo('/maintenance')
  }

  if (!isMaintenance && to.path === '/maintenance') {
    return navigateTo('/rebus')
  }
})
