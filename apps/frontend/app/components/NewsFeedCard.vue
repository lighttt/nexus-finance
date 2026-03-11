<script setup lang="ts">
interface NewsItem {
  title: string
  summary: string
  readMoreLink: string
  source: string
  datetime: number
}

const props = defineProps<{
  items: NewsItem[]
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
    <h2 class="mb-4 text-base font-semibold tracking-tight">Latest News</h2>

    <ul v-if="props.items.length" class="space-y-3">
      <li
        v-for="article in props.items"
        :key="`${article.readMoreLink}-${article.datetime}`"
        class="rounded-xl border border-[var(--nf-line)] bg-white/70 p-3"
      >
        <a
          :href="article.readMoreLink"
          target="_blank"
          rel="noopener noreferrer"
          class="text-sm font-semibold text-[var(--nf-ink)] underline-offset-2 hover:underline"
        >
          {{ article.title }}
        </a>
        <p class="mt-1 line-clamp-2 text-xs text-[var(--nf-muted)]">{{ article.summary }}</p>
        <p class="mt-2 text-xs text-[var(--nf-muted)]">
          {{ article.source }} • {{ formatDate(article.datetime) }}
        </p>
      </li>
    </ul>

    <p v-else class="text-sm text-[var(--nf-muted)]">No news available.</p>
  </section>
</template>
