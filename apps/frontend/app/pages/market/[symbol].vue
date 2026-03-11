<script setup lang="ts">
definePageMeta({
  middleware: ['auth'],
})

const route = useRoute()
const symbol = computed(() => String(route.params.symbol || '').toUpperCase())
</script>

<template>
  <main class="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
    <section class="rounded-3xl border border-[var(--nf-line)] bg-white/65 px-6 py-7 backdrop-blur-sm">
      <p class="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--nf-muted)]">Detail</p>
      <h1 class="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{{ symbol }}</h1>
      <p class="mt-2 max-w-2xl text-sm text-[var(--nf-muted)]">
        Symbol detail page is ready. Next step is adding 90-day candlestick chart, company news cards, and AI insight
        cards.
      </p>

      <NuxtLink
        to="/market"
        class="mt-5 inline-flex rounded-lg border border-[var(--nf-line)] bg-white px-3 py-1.5 text-sm font-medium hover:bg-slate-50"
      >
        Back to full table
      </NuxtLink>
    </section>
  </main>
</template>
