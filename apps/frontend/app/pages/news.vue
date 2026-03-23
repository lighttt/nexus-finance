<script setup lang="ts">
definePageMeta({
  middleware: ['auth'],
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

const items = ref<NewsItem[]>([])
const currentPage = ref(0)
const total = ref(0)
const hasMore = ref(true)
const initialPending = ref(true)
const loadingMore = ref(false)
const errorMessage = ref('')
const sentinel = ref<HTMLElement | null>(null)

let observer: IntersectionObserver | null = null

const loadedCountLabel = computed(() => `${items.value.length} of ${total.value || 0}`)

const loadNewsPage = async (page: number, mode: 'replace' | 'append' = 'append') => {
  if (mode === 'append' && (loadingMore.value || !hasMore.value)) {
    return
  }

  if (mode === 'replace') {
    initialPending.value = true
  } else {
    loadingMore.value = true
  }

  errorMessage.value = ''

  try {
    const payload = await $fetch<NewsPayload>('/api/news', {
      query: {
        page: String(page),
        limit: String(limit),
      },
    })

    const incoming = payload.news
    if (mode === 'replace') {
      items.value = incoming
    } else {
      const existingKeys = new Set(items.value.map((item) => `${item.readMoreLink}-${item.datetime}`))
      const deduped = incoming.filter((item) => !existingKeys.has(`${item.readMoreLink}-${item.datetime}`))
      items.value = [...items.value, ...deduped]
    }

    currentPage.value = payload.page
    total.value = payload.total
    hasMore.value = payload.hasMore
  } catch {
    errorMessage.value = 'Could not load the news right now.'
  } finally {
    initialPending.value = false
    loadingMore.value = false
  }
}

const loadMore = async () => {
  if (!hasMore.value || loadingMore.value) return
  await loadNewsPage(currentPage.value + 1, 'append')
}

const retry = async () => {
  if (!items.value.length) {
    await loadNewsPage(1, 'replace')
    return
  }

  await loadMore()
}

const setupObserver = () => {
  observer?.disconnect()

  if (!import.meta.client || !sentinel.value || typeof IntersectionObserver === 'undefined') {
    return
  }

  observer = new IntersectionObserver(
    async (entries) => {
      const [entry] = entries
      if (entry?.isIntersecting) {
        await loadMore()
      }
    },
    {
      rootMargin: '320px 0px',
    },
  )

  observer.observe(sentinel.value)
}

watch(sentinel, () => {
  setupObserver()
})

onMounted(async () => {
  await loadNewsPage(1, 'replace')
  setupObserver()
})

onBeforeUnmount(() => {
  observer?.disconnect()
})
</script>

<template>
  <main class="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
    <section class="rounded-3xl border border-[var(--nf-line)] bg-white/65 px-6 py-7 backdrop-blur-sm">
      <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--nf-muted)]">Market News</p>
          <h1 class="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Latest News</h1>
          <p class="mt-2 max-w-2xl text-sm text-[var(--nf-muted)]">
            Browse the full news feed with more stories loading as you scroll.
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

    <section class="mt-4 space-y-4">
      <NewsFeedCard :items="items" :loading="initialPending" />

      <div v-if="errorMessage" class="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800">
        <p class="font-semibold">{{ errorMessage }}</p>
        <button
          class="mt-3 rounded-lg border border-rose-300 px-3 py-1.5 text-sm font-medium hover:bg-rose-100"
          @click="retry"
        >
          Retry
        </button>
      </div>

      <div
        v-if="!initialPending"
        class="rounded-2xl border border-[var(--nf-line)] bg-white/80 p-4"
      >
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p class="text-sm text-[var(--nf-muted)]">
            Loaded {{ loadedCountLabel }}
            <span v-if="loadingMore"> · Loading more stories…</span>
            <span v-else-if="!hasMore && items.length"> · You are all caught up</span>
          </p>

          <button
            v-if="hasMore"
            class="inline-flex rounded-lg border border-[var(--nf-line)] bg-white px-3 py-1.5 text-sm font-medium hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="loadingMore"
            @click="loadMore"
          >
            {{ loadingMore ? 'Loading...' : 'Load more' }}
          </button>
        </div>
      </div>

      <div
        v-if="hasMore"
        ref="sentinel"
        class="h-4 w-full"
        aria-hidden="true"
      />
    </section>
  </main>
</template>
