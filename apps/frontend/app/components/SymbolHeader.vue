<script setup lang="ts">
const props = defineProps<{
  symbol: string
}>()
</script>

<template>
  <section class="mb-4 rounded-3xl border border-[var(--nf-line)] bg-white/65 px-6 py-7 backdrop-blur-sm">
    <p class="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--nf-muted)]">Symbol Intelligence</p>
    <div class="mt-2 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight sm:text-4xl">{{ props.symbol }}</h1>
        <p class="mt-2 max-w-2xl text-sm text-[var(--nf-muted)]">
          Quote, news flow, earnings context, and Bedrock-ready risk signals for {{ props.symbol }}.
        </p>
      </div>

      <NuxtLink
        to="/market"
        class="inline-flex rounded-lg border border-[var(--nf-line)] bg-white px-3 py-1.5 text-sm font-medium hover:bg-slate-50"
      >
        Back to full table
      </NuxtLink>
    </div>
  </section>
</template>
