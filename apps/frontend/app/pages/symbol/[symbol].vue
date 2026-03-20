<script setup lang="ts">
import type { SymbolIntelligenceResponse } from '~/types/symbol'

definePageMeta({
  middleware: ['auth'],
})

const config = useRuntimeConfig()
const route = useRoute()
const symbol = computed(() => String(route.params.symbol || '').toUpperCase())
const pageTitle = computed(() => `${symbol.value} Intelligence | Nexus Finance`)
const pageDescription = computed(() => `Live quote, news, earnings, and analyst signals for ${symbol.value}.`)
const canonicalUrl = computed(() =>
  config.public.siteUrl ? `${config.public.siteUrl}/symbol/${encodeURIComponent(symbol.value)}` : '',
)

useSeoMeta({
  title: () => pageTitle.value,
  description: () => pageDescription.value,
  ogTitle: () => pageTitle.value,
  ogDescription: () => pageDescription.value,
  ogType: 'website',
  ogUrl: () => canonicalUrl.value || undefined,
  twitterCard: 'summary_large_image',
  twitterTitle: () => pageTitle.value,
  twitterDescription: () => pageDescription.value,
})

useHead(() =>
  canonicalUrl.value
    ? {
        link: [{ rel: 'canonical', href: canonicalUrl.value }],
      }
    : {},
)

const {
  data: intelligence,
  pending,
  error,
  refresh,
} = useFetch<SymbolIntelligenceResponse>('/api/symbol-intelligence', {
  query: computed(() => ({ symbol: symbol.value })),
  server: false,
  lazy: true,
})
</script>

<template>
  <main class="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
    <SymbolHeader :symbol="symbol" />

    <section v-if="pending" class="space-y-4">
      <div class="grid gap-4 lg:grid-cols-3">
        <div v-for="i in 3" :key="`hero-loading-${i}`" class="rounded-2xl border border-[var(--nf-line)] bg-white/70 p-5">
          <div class="nf-shimmer h-4 w-24 rounded-md" />
          <div class="nf-shimmer mt-4 h-9 w-40 rounded-md" />
          <div class="nf-shimmer mt-3 h-4 w-32 rounded-md" />
        </div>
      </div>

      <div class="grid gap-4 lg:grid-cols-[1.3fr_0.9fr]">
        <div class="rounded-2xl border border-[var(--nf-line)] bg-white/70 p-5">
          <div class="nf-shimmer h-5 w-40 rounded-md" />
          <div v-for="i in 4" :key="`news-loading-${i}`" class="mt-4 grid grid-cols-[96px_1fr] gap-4">
            <div class="nf-shimmer h-20 rounded-xl" />
            <div>
              <div class="nf-shimmer h-4 w-3/4 rounded-md" />
              <div class="nf-shimmer mt-2 h-4 w-full rounded-md" />
              <div class="nf-shimmer mt-2 h-4 w-1/2 rounded-md" />
            </div>
          </div>
        </div>

        <div class="space-y-4">
          <div v-for="i in 2" :key="`side-loading-${i}`" class="rounded-2xl border border-[var(--nf-line)] bg-white/70 p-5">
            <div class="nf-shimmer h-5 w-32 rounded-md" />
            <div class="nf-shimmer mt-4 h-4 w-full rounded-md" />
            <div class="nf-shimmer mt-2 h-4 w-4/5 rounded-md" />
            <div class="nf-shimmer mt-2 h-4 w-3/5 rounded-md" />
          </div>
        </div>
      </div>
    </section>

    <section v-else-if="error" class="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-800">
      <p class="font-semibold">Unable to load symbol intelligence.</p>
      <button
        class="mt-3 rounded-lg border border-rose-300 px-3 py-1.5 text-sm font-medium hover:bg-rose-100"
        @click="refresh()"
      >
        Retry
      </button>
    </section>

    <section v-else-if="intelligence" class="space-y-4">
      <SymbolOverviewGrid :intelligence="intelligence" />
      <SymbolAiPanel :intelligence="intelligence" />

      <div class="grid gap-4 lg:grid-cols-[1.3fr_0.9fr]">
        <SymbolNewsSection :symbol="symbol" :items="intelligence.companyNews" />

        <div class="space-y-4">
          <SymbolEarningsHistory :items="intelligence.earnings" />
          <SymbolAnalystTrend :items="intelligence.recommendationTrend" />
        </div>
      </div>
    </section>
  </main>
</template>
