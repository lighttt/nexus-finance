<script setup lang="ts">
import { useHead } from 'nuxt/app';

useHead({
  htmlAttrs: {
    lang: 'en',
  },
  titleTemplate: (titleChunk) =>
    titleChunk ? `${titleChunk} | Nexus Finance` : 'Nexus Finance',
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { name: 'format-detection', content: 'telephone=no' },
  ],
  link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
})
</script>

<template>
  <NuxtRouteAnnouncer />
  <NuxtPage />
</template>
