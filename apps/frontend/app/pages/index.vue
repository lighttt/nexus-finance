<script setup lang="ts">
import { useRuntimeConfig, useAsyncData, useHead, useSeoMeta } from 'nuxt/app'

interface MarketItem {
  symbol: string
  price: number
  change: number
  changePercent: number
}

interface DashboardPayload {
  gainers: MarketItem[]
  losers: MarketItem[]
  news: {
    title: string
    summary: string
    readMoreLink: string
    source: string
    datetime: number
    image: string | null
    related: string
    category: string
  }[]
}

const config = useRuntimeConfig()
const pageTitle = 'Real-Time NASDAQ Intelligence'
const pageDescription = 'Track top market movers and latest company headlines with Nexus Finance.'
const canonicalUrl = config.public.siteUrl
const apiBase = config.public.apiBase

useSeoMeta({
  title: pageTitle,
  description: pageDescription,
  ogTitle: pageTitle,
  ogDescription: pageDescription,
  ogType: 'website',
  ogUrl: canonicalUrl || undefined,
  twitterCard: 'summary_large_image',
  twitterTitle: pageTitle,
  twitterDescription: pageDescription,
})

useHead(() => ({
  link: canonicalUrl ? [{ rel: 'canonical', href: canonicalUrl }] : [],
}))

const {
  data: dashboard,
  pending,
  error,
  refresh,
} = useAsyncData<DashboardPayload>('dashboard', async () => {
  if (!apiBase) {
    throw new Error('NUXT_PUBLIC_API_BASE is not configured')
  }

  const [marketOverview, latestNews] = await Promise.all([
    $fetch<{ gainers: MarketItem[]; losers: MarketItem[] }>(`${apiBase}/market-overview`),
    $fetch<{ news: DashboardPayload['news'] }>(`${apiBase}/news`),
  ])

  return {
    gainers: marketOverview.gainers,
    losers: marketOverview.losers,
    news: latestNews.news,
  }
})
</script>

<template>
  <main class="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
    <header class="mb-8 rounded-3xl border border-[var(--nf-line)] bg-white/65 px-6 py-7 backdrop-blur-sm">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--nf-muted)]">Nexus Finance</p>
          <h1 class="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Real-Time NASDAQ Intelligence</h1>
          <p class="mt-2 max-w-2xl text-sm text-[var(--nf-muted)]">
            Live market movers and curated company news powered by Finnhub.
          </p>
        </div>

        <ClerkLoaded>
          <div class="flex items-center gap-2">
            <Show when="signed-out">
              <SignInButton mode="modal">
                <button
                  class="rounded-lg border border-[var(--nf-line)] bg-white px-3 py-1.5 text-sm font-medium hover:bg-slate-50"
                >
                  Sign in
                </button>
              </SignInButton>
            </Show>
            <Show when="signed-in">
              <UserButton />
            </Show>
          </div>
        </ClerkLoaded>
      </div>

      <div class="mt-5 flex flex-wrap items-center gap-2">
        <NuxtLink
          to="/market"
          class="rounded-lg bg-[var(--nf-ink)] px-3 py-1.5 text-sm font-medium text-white hover:opacity-90"
        >
          View Full NASDAQ Table
        </NuxtLink>
      </div>
    </header>

    <section v-if="pending" class="grid gap-4 md:grid-cols-2">
      <div class="h-56 animate-pulse rounded-2xl border border-[var(--nf-line)] bg-white/70" />
      <div class="h-56 animate-pulse rounded-2xl border border-[var(--nf-line)] bg-white/70" />
      <div class="h-72 animate-pulse rounded-2xl border border-[var(--nf-line)] bg-white/70 md:col-span-2" />
    </section>

    <section v-else-if="error" class="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-800">
      <p class="font-semibold">Unable to load dashboard data.</p>
      <p class="mt-1 text-sm">Check backend availability and `NUXT_PUBLIC_API_BASE` configuration.</p>
      <button
        class="mt-4 rounded-lg border border-rose-300 px-3 py-1.5 text-sm font-medium hover:bg-rose-100"
        @click="refresh()"
      >
        Retry
      </button>
    </section>

    <section v-else-if="dashboard" class="space-y-4">
      <div class="grid gap-4 md:grid-cols-2">
        <MarketListCard title="Top Gainers" :items="dashboard.gainers" type="gainers" />
        <MarketListCard title="Top Losers" :items="dashboard.losers" type="losers" />
      </div>

      <NewsFeedCard :items="dashboard.news" />
    </section>
  </main>
</template>
