<script setup lang="ts">
import { useRuntimeConfig } from 'nuxt/app';

const config = useRuntimeConfig()
</script>

<template>
  <main class="mx-auto flex min-h-[70vh] max-w-6xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
    <SignUp
      :path="config.public.clerkSignUpUrl || '/sign-up'"
      routing="path"
      :sign-in-url="config.public.clerkSignInUrl || '/sign-in'"
    />
  </main>
</template>
