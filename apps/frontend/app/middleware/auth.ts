import { defineNuxtRouteMiddleware, navigateTo, useRequestEvent, useRuntimeConfig } from 'nuxt/app'

export default defineNuxtRouteMiddleware(() => {
  const config = useRuntimeConfig()
  const signInUrl = config.public.clerkSignInUrl || '/sign-in'

  if (import.meta.server) {
    const event = useRequestEvent()
    const auth = event?.context.auth

    if (typeof auth === 'function') {
      const { isAuthenticated } = auth()

      if (!isAuthenticated) {
        return navigateTo(signInUrl)
      }
    }

    return
  }

  const { isSignedIn, isLoaded } = useAuth()

  if (!isLoaded.value) {
    return
  }

  if (!isSignedIn.value) {
    return navigateTo(signInUrl)
  }
})
