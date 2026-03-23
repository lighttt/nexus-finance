<script setup lang="ts">
import type { SymbolNewsResponse } from '~/types/symbol'

const props = defineProps<{
  symbol: string
  items: SymbolNewsResponse[]
}>()

const formatDateTime = (value: number) =>
  new Date(value * 1000).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
</script>

<template>
  <article class="rounded-2xl border border-[var(--nf-line)] bg-white/85 p-4 shadow-sm">
    <div class="flex items-center justify-between gap-4">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--nf-muted)]">Recent Company News</p>
        <h2 class="mt-1 text-xl font-semibold">What is moving {{ props.symbol }}</h2>
      </div>
      <span class="rounded-full border border-[var(--nf-line)] bg-[var(--nf-surface)] px-3 py-1 text-xs font-semibold text-[var(--nf-muted)]">
        {{ props.items.length }} stories
      </span>
    </div>

    <div v-if="!props.items.length" class="mt-3 rounded-xl border border-[var(--nf-line)] bg-[var(--nf-surface)] p-3.5 text-sm text-[var(--nf-muted)]">
      No company news available right now.
    </div>

    <div v-else class="mt-3 space-y-3">
      <a
        v-for="item in props.items.slice(0, 6)"
        :key="`${item.readMoreLink}-${item.datetime}`"
        :href="item.readMoreLink"
        target="_blank"
        rel="noreferrer"
        class="grid gap-3 rounded-2xl border border-[var(--nf-line)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(246,249,244,0.95))] p-3.5 transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-sm md:grid-cols-[118px_1fr]"
      >
        <div class="overflow-hidden rounded-xl border border-[var(--nf-line)] bg-[var(--nf-surface)]">
          <img
            v-if="item.image"
            :src="item.image"
            :alt="item.title"
            class="h-full min-h-[92px] w-full object-cover"
          />
          <div v-else class="flex h-full min-h-[92px] items-center justify-center bg-[linear-gradient(135deg,#edf4ea,#dbe8d8)] text-xs font-semibold uppercase tracking-[0.14em] text-[var(--nf-muted)]">
            {{ props.symbol }}
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
</template>
