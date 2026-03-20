<script setup lang="ts">
definePageMeta({
  middleware: ['auth'],
})

const route = useRoute()
const page = computed(() => {
  const raw = Number(route.query.page)
  return Number.isFinite(raw) && raw > 0 ? raw : 1
})
const limit = 12

interface NewsItem {
  title: string
  summary: string
  readMoreLink: string
  source: string
  datetime: number
  image: string | null
  related: string
  category: string
}

interface NewsPayload {
  news: NewsItem[]
  page: number
  limit: number
  total: number
  hasMore: boolean
}

const {
  data,
  pending,
  error,
  refresh,
} = useFetch<NewsPayload>('/api/news', {
  query: computed(() => ({ page: String(page.value), limit: String(limit) })),
  server: false,
  lazy: true,
})

const previousPage = computed(() => Math.max(1, page.value - 1))
const nextPage = computed(() => page.value + 1)
</script>

<template>
  <main class="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
    <section class="rounded-3xl border border-[var(--nf-line)] bg-white/65 px-6 py-7 backdrop-blur-sm">
      <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--nf-muted)]">Market News</p>
          <h1 class="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">All Latest News</h1>
          <p class="mt-2 max-w-2xl text-sm text-[var(--nf-muted)]">
            Browse the full news stream with pagination, summaries, and direct source links.
          </p>
        </div>

        <NuxtLink
          to="/"
          class="inline-flex rounded-lg border border-[var(--nf-line)] bg-white px-3 py-1.5 text-sm font-medium hover:bg-slate-50"
        >
          Back to dashboard
        </NuxtLink>
      </div>
    </section>

    <section class="mt-4">
      <NewsFeedCard :items="data?.news || []" :loading="pending" />

      <div v-if="error" class="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800">
        <p class="font-semibold">Unable to load news.</p>
        <button
          class="mt-3 rounded-lg border border-rose-300 px-3 py-1.5 text-sm font-medium hover:bg-rose-100"
          @click="refresh()"
        >
          Retry
        </button>
      </div>

      <div v-if="data" class="mt-4 flex items-center justify-between gap-4 rounded-2xl border border-[var(--nf-line)] bg-white/80 p-4">
        <p class="text-sm text-[var(--nf-muted)]">
          Page {{ data.page }} · Showing {{ data.news.length }} of {{ data.total }} stories
        </p>

        <div class="flex items-center gap-2">
          <NuxtLink
            :to="page > 1 ? `/news?page=${previousPage}` : '/news?page=1'"
            class="rounded-lg border border-[var(--nf-line)] bg-white px-3 py-1.5 text-sm font-medium"
            :class="page <= 1 ? 'pointer-events-none opacity-50' : 'hover:bg-slate-50'"
          >
            Previous
          </NuxtLink>
          <NuxtLink
            :to="`/news?page=${nextPage}`"
            class="rounded-lg border border-[var(--nf-line)] bg-white px-3 py-1.5 text-sm font-medium"
            :class="!data.hasMore ? 'pointer-events-none opacity-50' : 'hover:bg-slate-50'"
          >
            Next
          </NuxtLink>
        </div>
      </div>
    </section>
  </main>
</template>
