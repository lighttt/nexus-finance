import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', '@clerk/nuxt'],
  css: ['~/assets/css/main.css', 'vue3-easy-data-table/dist/style.css'],
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE,
      apiProtectedBase: process.env.NUXT_PUBLIC_API_PROTECTED_BASE,
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL,
      clerkSignInUrl: process.env.NUXT_PUBLIC_CLERK_SIGN_IN_URL || '/sign-in',
      clerkSignUpUrl: process.env.NUXT_PUBLIC_CLERK_SIGN_UP_URL || '/sign-up',
    },
  },
})
