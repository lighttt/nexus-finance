<script setup lang="ts">
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

interface SymbolQuoteResponse {
  price: number
  change: number
  changePercent: number
  dayHigh: number
  dayLow: number
  dayOpen: number
  previousClose: number
}

interface SymbolNewsResponse {
  title: string
  summary: string
  readMoreLink: string
  source: string
  datetime: number
  image: string | null
}

interface EarningsResponse {
  actual: number | null
  estimate: number | null
  period: string
  quarter: number
  symbol: string
  surprise: number | null
  surprisePercent: number | null
  year: number
}

interface RecommendationResponse {
  buy: number
  hold: number
  period: string
  sell: number
  strongBuy: number
  strongSell: number
  symbol: string
}

interface NextEarningsResponse {
  date: string
  epsActual: number | null
  epsEstimate: number | null
  hour: string
  quarter: number
  revenueActual: number | null
  revenueEstimate: number | null
  symbol: string
  year: number
}

interface SymbolIntelligenceResponse {
  symbol: string
  quote: SymbolQuoteResponse
  companyNews: SymbolNewsResponse[]
  earnings: EarningsResponse[]
  recommendationTrend: RecommendationResponse[]
  nextEarnings: NextEarningsResponse | null
  insight: {
    sentimentDivergence: number
    eventRisk: 'Low' | 'Medium' | 'High'
    downsideProtection: 'Low' | 'Medium' | 'High'
  }
  bedrockInput: Record<string, unknown>
}

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

const priceDirectionClass = computed(() => {
  const change = intelligence.value?.quote.change ?? 0
  if (change > 0) return 'text-emerald-700'
  if (change < 0) return 'text-rose-700'
  return 'text-slate-700'
})

const scoreToneClass = (value: 'Low' | 'Medium' | 'High') => {
  if (value === 'High') return 'border-rose-200 bg-rose-50 text-rose-700'
  if (value === 'Medium') return 'border-amber-200 bg-amber-50 text-amber-700'
  return 'border-emerald-200 bg-emerald-50 text-emerald-700'
}

const formatCurrency = (value: number | null | undefined) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return '--'
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 })
}

const formatPercent = (value: number | null | undefined) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return '--'
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
}

const formatDateTime = (value: number) =>
  new Date(value * 1000).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
</script>

<template>
  <main class="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
    <section class="mb-4 rounded-3xl border border-[var(--nf-line)] bg-white/65 px-6 py-7 backdrop-blur-sm">
      <p class="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--nf-muted)]">Symbol Intelligence</p>
      <div class="mt-2 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 class="text-3xl font-bold tracking-tight sm:text-4xl">{{ symbol }}</h1>
          <p class="mt-2 max-w-2xl text-sm text-[var(--nf-muted)]">
            Quote, news flow, earnings context, and Bedrock-ready risk signals for {{ symbol }}.
          </p>
        </div>

        <NuxtLink
          to="/market"
          class="inline-flex rounded-lg border border-[var(--nf-line)] bg-white px-3 py-1.5 text-sm font-medium hover:bg-slate-50"
        >
          Back to full table
        </NuxtLink>
      </div>
    </section>

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
      <div class="grid gap-4 lg:grid-cols-3">
        <article class="rounded-2xl border border-[var(--nf-line)] bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(235,244,237,0.88))] p-5 shadow-sm">
          <p class="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--nf-muted)]">Live Quote</p>
          <div class="mt-3 flex items-end gap-3">
            <p class="text-3xl font-bold tracking-tight">{{ formatCurrency(intelligence.quote.price) }}</p>
            <p class="pb-1 text-sm font-semibold" :class="priceDirectionClass">
              {{ formatPercent(intelligence.quote.changePercent) }}
            </p>
          </div>
          <div class="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div class="rounded-xl border border-[var(--nf-line)] bg-white/75 p-3">
              <p class="text-xs uppercase tracking-[0.12em] text-[var(--nf-muted)]">Day High</p>
              <p class="mt-1 font-semibold">{{ formatCurrency(intelligence.quote.dayHigh) }}</p>
            </div>
            <div class="rounded-xl border border-[var(--nf-line)] bg-white/75 p-3">
              <p class="text-xs uppercase tracking-[0.12em] text-[var(--nf-muted)]">Day Low</p>
              <p class="mt-1 font-semibold">{{ formatCurrency(intelligence.quote.dayLow) }}</p>
            </div>
            <div class="rounded-xl border border-[var(--nf-line)] bg-white/75 p-3">
              <p class="text-xs uppercase tracking-[0.12em] text-[var(--nf-muted)]">Open</p>
              <p class="mt-1 font-semibold">{{ formatCurrency(intelligence.quote.dayOpen) }}</p>
            </div>
            <div class="rounded-xl border border-[var(--nf-line)] bg-white/75 p-3">
              <p class="text-xs uppercase tracking-[0.12em] text-[var(--nf-muted)]">Prev Close</p>
              <p class="mt-1 font-semibold">{{ formatCurrency(intelligence.quote.previousClose) }}</p>
            </div>
          </div>
        </article>

        <article class="rounded-2xl border border-[var(--nf-line)] bg-white/85 p-5 shadow-sm">
          <p class="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--nf-muted)]">Risk Signals</p>
          <div class="mt-4 space-y-3">
            <div class="rounded-xl border border-[var(--nf-line)] bg-[var(--nf-surface)] p-3">
              <div class="flex items-center justify-between gap-3">
                <span class="text-sm font-medium">Sentiment Divergence</span>
                <span class="text-lg font-bold">{{ intelligence.insight.sentimentDivergence }}/100</span>
              </div>
            </div>
            <div class="flex items-center justify-between rounded-xl border p-3 text-sm" :class="scoreToneClass(intelligence.insight.eventRisk)">
              <span class="font-medium">Event Risk</span>
              <span class="font-semibold">{{ intelligence.insight.eventRisk }}</span>
            </div>
            <div
              class="flex items-center justify-between rounded-xl border p-3 text-sm"
              :class="scoreToneClass(intelligence.insight.downsideProtection === 'High' ? 'Low' : intelligence.insight.downsideProtection === 'Low' ? 'High' : 'Medium')"
            >
              <span class="font-medium">Downside Protection</span>
              <span class="font-semibold">{{ intelligence.insight.downsideProtection }}</span>
            </div>
          </div>
        </article>

        <article class="rounded-2xl border border-[var(--nf-line)] bg-white/85 p-5 shadow-sm">
          <p class="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--nf-muted)]">Next Catalyst</p>
          <div v-if="intelligence.nextEarnings" class="mt-4">
            <p class="text-2xl font-bold">{{ intelligence.nextEarnings.date }}</p>
            <p class="mt-2 text-sm text-[var(--nf-muted)]">
              Earnings expected {{ intelligence.nextEarnings.hour.toUpperCase() }} for Q{{ intelligence.nextEarnings.quarter }} {{ intelligence.nextEarnings.year }}.
            </p>
            <div class="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div class="rounded-xl border border-[var(--nf-line)] bg-[var(--nf-surface)] p-3">
                <p class="text-xs uppercase tracking-[0.12em] text-[var(--nf-muted)]">EPS Estimate</p>
                <p class="mt-1 font-semibold">{{ intelligence.nextEarnings.epsEstimate ?? '--' }}</p>
              </div>
              <div class="rounded-xl border border-[var(--nf-line)] bg-[var(--nf-surface)] p-3">
                <p class="text-xs uppercase tracking-[0.12em] text-[var(--nf-muted)]">Revenue Estimate</p>
                <p class="mt-1 font-semibold">{{ formatCurrency(intelligence.nextEarnings.revenueEstimate) }}</p>
              </div>
            </div>
          </div>
          <div v-else class="mt-4 rounded-xl border border-[var(--nf-line)] bg-[var(--nf-surface)] p-4 text-sm text-[var(--nf-muted)]">
            No upcoming earnings event returned for the current window.
          </div>
        </article>
      </div>

      <div class="grid gap-4 lg:grid-cols-[1.3fr_0.9fr]">
        <article class="rounded-2xl border border-[var(--nf-line)] bg-white/85 p-5 shadow-sm">
          <div class="flex items-center justify-between gap-4">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--nf-muted)]">Recent Company News</p>
              <h2 class="mt-1 text-xl font-semibold">What is moving {{ symbol }}</h2>
            </div>
            <span class="rounded-full border border-[var(--nf-line)] bg-[var(--nf-surface)] px-3 py-1 text-xs font-semibold text-[var(--nf-muted)]">
              {{ intelligence.companyNews.length }} stories
            </span>
          </div>

          <div v-if="!intelligence.companyNews.length" class="mt-4 rounded-xl border border-[var(--nf-line)] bg-[var(--nf-surface)] p-4 text-sm text-[var(--nf-muted)]">
            No company news available right now.
          </div>

          <div v-else class="mt-4 space-y-4">
            <a
              v-for="item in intelligence.companyNews.slice(0, 6)"
              :key="`${item.readMoreLink}-${item.datetime}`"
              :href="item.readMoreLink"
              target="_blank"
              rel="noreferrer"
              class="grid gap-4 rounded-2xl border border-[var(--nf-line)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(246,249,244,0.95))] p-4 transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-sm md:grid-cols-[124px_1fr]"
            >
              <div class="overflow-hidden rounded-xl border border-[var(--nf-line)] bg-[var(--nf-surface)]">
                <img
                  v-if="item.image"
                  :src="item.image"
                  :alt="item.title"
                  class="h-full min-h-[92px] w-full object-cover"
                />
                <div v-else class="flex h-full min-h-[92px] items-center justify-center bg-[linear-gradient(135deg,#edf4ea,#dbe8d8)] text-xs font-semibold uppercase tracking-[0.14em] text-[var(--nf-muted)]">
                  {{ symbol }}
                </div>
              </div>

              <div>
                <div class="flex flex-wrap items-center gap-2 text-xs text-[var(--nf-muted)]">
                  <span>{{ item.source }}</span>
                  <span class="h-1 w-1 rounded-full bg-[var(--nf-muted)]/50" />
                  <span>{{ formatDateTime(item.datetime) }}</span>
                </div>
                <h3 class="mt-2 text-base font-semibold leading-snug text-[var(--nf-ink)]">{{ item.title }}</h3>
                <p class="mt-2 line-clamp-3 text-sm text-[var(--nf-muted)]">{{ item.summary || 'Open the article for full context.' }}</p>
              </div>
            </a>
          </div>
        </article>

        <div class="space-y-4">
          <article class="rounded-2xl border border-[var(--nf-line)] bg-white/85 p-5 shadow-sm">
            <p class="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--nf-muted)]">Earnings History</p>
            <div v-if="!intelligence.earnings.length" class="mt-4 text-sm text-[var(--nf-muted)]">No earnings data available.</div>
            <div v-else class="mt-4 space-y-3">
              <div
                v-for="item in intelligence.earnings"
                :key="`${item.period}-${item.quarter}`"
                class="rounded-xl border border-[var(--nf-line)] bg-[var(--nf-surface)] p-3"
              >
                <div class="flex items-center justify-between gap-3">
                  <div>
                    <p class="text-sm font-semibold">Q{{ item.quarter }} {{ item.year }}</p>
                    <p class="text-xs text-[var(--nf-muted)]">{{ item.period }}</p>
                  </div>
                  <span
                    class="rounded-full px-2.5 py-1 text-xs font-semibold"
                    :class="
                      (item.surprisePercent ?? 0) >= 0
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-rose-50 text-rose-700'
                    "
                  >
                    {{ formatPercent(item.surprisePercent) }}
                  </span>
                </div>
              </div>
            </div>
          </article>

          <article class="rounded-2xl border border-[var(--nf-line)] bg-white/85 p-5 shadow-sm">
            <p class="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--nf-muted)]">Analyst Trend</p>
            <div v-if="!intelligence.recommendationTrend.length" class="mt-4 text-sm text-[var(--nf-muted)]">
              No recommendation trend data available.
            </div>
            <div v-else class="mt-4 space-y-3">
              <div
                v-for="item in intelligence.recommendationTrend"
                :key="item.period"
                class="rounded-xl border border-[var(--nf-line)] bg-[var(--nf-surface)] p-3"
              >
                <div class="flex items-center justify-between gap-3">
                  <p class="text-sm font-semibold">{{ item.period }}</p>
                  <div class="flex gap-2 text-xs font-semibold">
                    <span class="rounded-full bg-emerald-50 px-2 py-1 text-emerald-700">B {{ item.buy + item.strongBuy }}</span>
                    <span class="rounded-full bg-slate-100 px-2 py-1 text-slate-700">H {{ item.hold }}</span>
                    <span class="rounded-full bg-rose-50 px-2 py-1 text-rose-700">S {{ item.sell + item.strongSell }}</span>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  </main>
</template>
