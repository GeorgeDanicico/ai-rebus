export default defineEventHandler((event) => {
  const {
    public: { maintenanceMode },
  } = useRuntimeConfig()
  const isMaintenanceEnabled = maintenanceMode === true || maintenanceMode === 'true'

  if (!isMaintenanceEnabled) {
    return
  }

  const { pathname } = getRequestURL(event)
  const isMaintenancePage = pathname === '/maintenance'
  const isNuxtAsset =
    pathname.startsWith('/_nuxt/') ||
    pathname.startsWith('/__nuxt') ||
    pathname.startsWith('/_ipx/')

  if (isMaintenancePage || isNuxtAsset || pathname === '/favicon.ico') {
    return
  }

  if (pathname.startsWith('/api/')) {
    setResponseStatus(event, 503, 'Service Unavailable')
    return {
      message: 'Service is under maintenance',
    }
  }

  return sendRedirect(event, '/maintenance', 307)
})
