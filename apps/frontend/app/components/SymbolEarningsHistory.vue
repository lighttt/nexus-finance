<script setup lang="ts">
import type { EarningsResponse } from '~/types/symbol'

const props = defineProps<{
  items: EarningsResponse[]
}>()

const formatPercent = (value: number | null | undefined) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return '--'
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
}
</script>

<template>
  <article class="rounded-2xl border border-[var(--nf-line)] bg-white/85 p-5 shadow-sm">
    <p class="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--nf-muted)]">Earnings History</p>
    <div v-if="!props.items.length" class="mt-4 text-sm text-[var(--nf-muted)]">No earnings data available.</div>
    <div v-else class="mt-4 space-y-3">
      <div
        v-for="item in props.items"
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
</template>
