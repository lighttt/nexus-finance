<script setup lang="ts">
import type { SymbolIntelligenceResponse } from '~/types/symbol'

const props = defineProps<{
  intelligence: SymbolIntelligenceResponse
}>()

const scoreToneClass = (value: 'Low' | 'Medium' | 'High') => {
  if (value === 'High') return 'border-rose-200 bg-rose-50 text-rose-700'
  if (value === 'Medium') return 'border-amber-200 bg-amber-50 text-amber-700'
  return 'border-emerald-200 bg-emerald-50 text-emerald-700'
}

const priceDirectionClass = computed(() => {
  const change = props.intelligence.quote.change ?? 0
  if (change > 0) return 'text-emerald-700'
  if (change < 0) return 'text-rose-700'
  return 'text-slate-700'
})

const formatCurrency = (value: number | null | undefined) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return '--'
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 })
}

const formatPercent = (value: number | null | undefined) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return '--'
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
}
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-3">
    <article class="rounded-2xl border border-[var(--nf-line)] bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(235,244,237,0.88))] p-5 shadow-sm">
      <p class="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--nf-muted)]">Price Now</p>
      <div class="mt-3 flex items-end gap-3">
        <p class="text-3xl font-bold tracking-tight">{{ formatCurrency(props.intelligence.quote.price) }}</p>
        <p class="pb-1 text-sm font-semibold" :class="priceDirectionClass">
          {{ formatPercent(props.intelligence.quote.changePercent) }}
        </p>
      </div>
      <div class="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div class="rounded-xl border border-[var(--nf-line)] bg-white/75 p-3">
          <p class="text-xs uppercase tracking-[0.12em] text-[var(--nf-muted)]">Day High</p>
          <p class="mt-1 font-semibold">{{ formatCurrency(props.intelligence.quote.dayHigh) }}</p>
        </div>
        <div class="rounded-xl border border-[var(--nf-line)] bg-white/75 p-3">
          <p class="text-xs uppercase tracking-[0.12em] text-[var(--nf-muted)]">Day Low</p>
          <p class="mt-1 font-semibold">{{ formatCurrency(props.intelligence.quote.dayLow) }}</p>
        </div>
        <div class="rounded-xl border border-[var(--nf-line)] bg-white/75 p-3">
          <p class="text-xs uppercase tracking-[0.12em] text-[var(--nf-muted)]">Open</p>
          <p class="mt-1 font-semibold">{{ formatCurrency(props.intelligence.quote.dayOpen) }}</p>
        </div>
        <div class="rounded-xl border border-[var(--nf-line)] bg-white/75 p-3">
          <p class="text-xs uppercase tracking-[0.12em] text-[var(--nf-muted)]">Previous Close</p>
          <p class="mt-1 font-semibold">{{ formatCurrency(props.intelligence.quote.previousClose) }}</p>
        </div>
      </div>
    </article>

    <article class="rounded-2xl border border-[var(--nf-line)] bg-white/85 p-5 shadow-sm">
      <p class="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--nf-muted)]">Quick Take</p>
      <p class="mt-1 text-xs text-[var(--nf-muted)]">Rule-based snapshot</p>
      <div class="mt-4 space-y-3">
        <div class="rounded-xl border border-[var(--nf-line)] bg-[var(--nf-surface)] p-3">
          <div class="flex items-center justify-between gap-3">
            <span class="text-sm font-medium">News vs Price</span>
            <span class="text-lg font-bold">{{ props.intelligence.insight.sentimentDivergence }}/100</span>
          </div>
        </div>
        <div class="flex items-center justify-between rounded-xl border p-3 text-sm" :class="scoreToneClass(props.intelligence.insight.eventRisk)">
          <span class="font-medium">Upcoming Event Risk</span>
          <span class="font-semibold">{{ props.intelligence.insight.eventRisk }}</span>
        </div>
        <div
          class="flex items-center justify-between rounded-xl border p-3 text-sm"
          :class="scoreToneClass(props.intelligence.insight.downsideProtection === 'High' ? 'Low' : props.intelligence.insight.downsideProtection === 'Low' ? 'High' : 'Medium')"
        >
          <span class="font-medium">Downside Cushion</span>
          <span class="font-semibold">{{ props.intelligence.insight.downsideProtection }}</span>
        </div>
      </div>
    </article>

    <article class="rounded-2xl border border-[var(--nf-line)] bg-white/85 p-5 shadow-sm">
      <p class="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--nf-muted)]">Next Key Date</p>
      <div v-if="props.intelligence.nextEarnings" class="mt-4">
        <p class="text-2xl font-bold">{{ props.intelligence.nextEarnings.date }}</p>
        <p class="mt-2 text-sm text-[var(--nf-muted)]">
          Earnings expected {{ props.intelligence.nextEarnings.hour.toUpperCase() }} for Q{{ props.intelligence.nextEarnings.quarter }} {{ props.intelligence.nextEarnings.year }}.
        </p>
        <div class="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div class="rounded-xl border border-[var(--nf-line)] bg-[var(--nf-surface)] p-3">
            <p class="text-xs uppercase tracking-[0.12em] text-[var(--nf-muted)]">EPS Estimate</p>
            <p class="mt-1 font-semibold">{{ props.intelligence.nextEarnings.epsEstimate ?? '--' }}</p>
          </div>
          <div class="rounded-xl border border-[var(--nf-line)] bg-[var(--nf-surface)] p-3">
            <p class="text-xs uppercase tracking-[0.12em] text-[var(--nf-muted)]">Revenue Estimate</p>
            <p class="mt-1 font-semibold">{{ formatCurrency(props.intelligence.nextEarnings.revenueEstimate) }}</p>
          </div>
        </div>
      </div>
      <div v-else class="mt-4 rounded-xl border border-[var(--nf-line)] bg-[var(--nf-surface)] p-4 text-sm text-[var(--nf-muted)]">
        No upcoming earnings date is available right now.
      </div>
    </article>
  </div>
</template>
