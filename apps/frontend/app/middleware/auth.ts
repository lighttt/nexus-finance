import { defineNuxtRouteMiddleware, navigateTo, useRuntimeConfig } from 'nuxt/app'

export default defineNuxtRouteMiddleware(() => {
  const config = useRuntimeConfig()
  const { isSignedIn, isLoaded } = useAuth()

  if (!isLoaded.value) {
    return
  }

  if (!isSignedIn.value) {
    return navigateTo(config.public.clerkSignInUrl || '/sign-in')
  }
})
