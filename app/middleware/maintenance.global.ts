export default defineNuxtRouteMiddleware((to) => {
  const config = useRuntimeConfig()
  const isMaintenance =
    config.public.maintenanceMode === true || config.public.maintenanceMode === 'true';

      console.log(isMaintenance);
      console.log(config.public.maintenanceMode);

  if (isMaintenance && to.path !== '/maintenance') {
    return navigateTo('/maintenance')
  }

  if (!isMaintenance && to.path === '/maintenance') {
    return navigateTo('/rebus')
  }
})
