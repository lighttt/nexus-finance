<script setup lang="ts">
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

const props = defineProps<{
  items: NewsItem[]
  loading?: boolean
}>()

const formatDate = (unixSeconds: number) =>
  new Date(unixSeconds * 1000).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
</script>

<template>
  <section class="rounded-2xl border border-[var(--nf-line)] bg-[var(--nf-surface)] p-5 shadow-sm">
    <div class="mb-4 flex items-center justify-between">
      <h2 class="text-base font-semibold tracking-tight">Latest News</h2>
      <span class="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-[var(--nf-muted)]">
        {{ props.items.length }} updates
      </span>
    </div>

    <ul v-if="props.loading" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <li
        v-for="i in 6"
        :key="`news-loading-${i}`"
        class="overflow-hidden rounded-xl border border-[var(--nf-line)] bg-white/80"
      >
        <div class="nf-shimmer h-40 w-full" />
        <div class="space-y-2 p-3">
          <div class="nf-shimmer h-4 w-full rounded-md" />
          <div class="nf-shimmer h-4 w-5/6 rounded-md" />
          <div class="nf-shimmer h-3 w-2/3 rounded-md" />
        </div>
      </li>
    </ul>

    <ul v-else-if="props.items.length" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <li
        v-for="article in props.items"
        :key="`${article.readMoreLink}-${article.datetime}`"
        class="overflow-hidden rounded-xl border border-[var(--nf-line)] bg-white/80"
      >
        <a :href="article.readMoreLink" target="_blank" rel="noopener noreferrer" class="block">
          <div class="relative h-40 w-full overflow-hidden bg-slate-100">
            <img
              v-if="article.image"
              :src="article.image"
              :alt="article.title"
              class="h-full w-full object-cover transition-transform duration-300 hover:scale-[1.03]"
              loading="lazy"
            />
            <div v-else class="flex h-full w-full items-center justify-center bg-slate-100 text-xs text-[var(--nf-muted)]">
              No Image
            </div>
            <span class="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white">
              {{ article.category || 'general' }}
            </span>
          </div>

          <div class="p-3">
            <p class="line-clamp-2 text-sm font-semibold text-[var(--nf-ink)]">{{ article.title }}</p>
            <p class="mt-1 line-clamp-3 text-xs text-[var(--nf-muted)]">{{ article.summary }}</p>
            <p class="mt-2 text-xs text-[var(--nf-muted)]">
              {{ article.source }} • {{ formatDate(article.datetime) }}
            </p>
          </div>
        </a>
      </li>
    </ul>

    <p v-else class="text-sm text-[var(--nf-muted)]">No news available.</p>
  </section>
</template>
