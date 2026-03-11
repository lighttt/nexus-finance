<script setup lang="ts">
import { useRuntimeConfig } from 'nuxt/app';

const config = useRuntimeConfig()
</script>

<template>
  <main class="mx-auto flex min-h-[70vh] max-w-6xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
    <SignIn
      :path="config.public.clerkSignInUrl || '/sign-in'"
      routing="path"
      :sign-up-url="config.public.clerkSignUpUrl || '/sign-up'"
    />
  </main>
</template>
