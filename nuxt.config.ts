// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint', '@nuxt/ui', '@nuxtjs/supabase', '@pinia/nuxt'],
  css: ['~/assets/css/main.css'],
  colorMode: {
    preference: 'light',
  },
  runtimeConfig: {
    openaiApiKey: process.env.OPENAI_API_KEY,
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    supabaseUrl: process.env.SUPABASE_URL,
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL,
    },
  },
  supabase: {
    redirect: false,
  },
  pinia: {}
})