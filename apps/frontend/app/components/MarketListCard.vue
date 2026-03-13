<script setup lang="ts">
interface MarketItem {
  symbol: string
  price: number
  change: number
  changePercent: number
}

const props = defineProps<{
  title: string
  items: MarketItem[]
  loading?: boolean
}>()

const formatPrice = (price: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(price)

const formatChange = (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
</script>

<template>
  <section class="rounded-2xl border border-[var(--nf-line)] bg-[var(--nf-surface)] p-5 shadow-sm">
    <h2 class="mb-4 text-base font-semibold tracking-tight">{{ props.title }}</h2>

    <ul v-if="props.loading" class="space-y-2">
      <li
        v-for="i in 5"
        :key="`market-loading-${i}`"
        class="rounded-xl border border-[var(--nf-line)] bg-white/70 px-3 py-2.5"
      >
        <div class="flex items-center justify-between">
          <div class="space-y-1">
            <div class="nf-shimmer h-4 w-16 rounded-md" />
            <div class="nf-shimmer h-3 w-20 rounded-md" />
          </div>
          <div class="nf-shimmer h-4 w-14 rounded-md" />
        </div>
      </li>
    </ul>

    <ul v-else-if="props.items.length" class="space-y-2">
      <li
        v-for="item in props.items"
        :key="item.symbol"
        class="flex items-center justify-between rounded-xl border border-[var(--nf-line)] bg-white/70 px-3 py-2.5"
      >
        <div>
          <p class="text-sm font-semibold">{{ item.symbol }}</p>
          <p class="text-xs text-[var(--nf-muted)]">{{ formatPrice(item.price) }}</p>
        </div>
        <p
          class="text-sm font-semibold"
          :class="item.changePercent >= 0 ? 'text-emerald-700' : 'text-rose-700'"
        >
          {{ formatChange(item.changePercent) }}
        </p>
      </li>
    </ul>

    <p v-else class="text-sm text-[var(--nf-muted)]">No market data available.</p>
  </section>
</template>
