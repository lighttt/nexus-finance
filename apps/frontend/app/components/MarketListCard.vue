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
  type: 'gainers' | 'losers'
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
    <div class="mb-4 flex items-center justify-between">
      <h2 class="text-base font-semibold tracking-tight">{{ props.title }}</h2>
      <span
        class="rounded-full px-2.5 py-1 text-xs font-medium"
        :class="
          props.type === 'gainers'
            ? 'bg-emerald-100 text-emerald-700'
            : 'bg-rose-100 text-rose-700'
        "
      >
        {{ props.items.length }} tracked
      </span>
    </div>

    <ul v-if="props.items.length" class="space-y-2">
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
