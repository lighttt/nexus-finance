<script setup lang="ts">
import type { RecommendationResponse } from '~/types/symbol'

const props = defineProps<{
  items: RecommendationResponse[]
}>()
</script>

<template>
  <article class="rounded-2xl border border-[var(--nf-line)] bg-white/85 p-5 shadow-sm">
    <p class="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--nf-muted)]">Analyst Trend</p>
    <div v-if="!props.items.length" class="mt-4 text-sm text-[var(--nf-muted)]">
      No recommendation trend data available.
    </div>
    <div v-else class="mt-4 space-y-3">
      <div
        v-for="item in props.items"
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
</template>
