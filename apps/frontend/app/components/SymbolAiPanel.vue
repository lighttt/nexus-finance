<script setup lang="ts">
import type { SymbolIntelligenceResponse } from '~/types/symbol'

const props = defineProps<{
  intelligence: SymbolIntelligenceResponse
}>()

const aiRiskPercent = computed(() => props.intelligence.aiInsight?.sentimentCorrelation.sentimentDivergenceScore ?? 0)
const aiRingCircumference = 427.26
const aiRingOffset = computed(() => aiRingCircumference - (Math.max(0, Math.min(100, aiRiskPercent.value)) / 100) * aiRingCircumference)
const aiDriverLabel = computed(() => props.intelligence.aiInsight?.sentimentCorrelation.marketDriver.replace(/-/g, ' ') ?? 'Not available')

const aiRiskLevelClass = computed(() => {
  const riskLevel = props.intelligence.aiInsight?.sentimentCorrelation.divergenceRisk
  if (riskLevel === 'High') return 'from-rose-500/20 to-orange-400/20 border-rose-200'
  if (riskLevel === 'Medium') return 'from-amber-400/20 to-yellow-300/20 border-amber-200'
  return 'from-emerald-400/20 to-teal-300/20 border-emerald-200'
})

const aiSummaryHeading = computed(() => {
  const riskLevel = props.intelligence.aiInsight?.sentimentCorrelation.divergenceRisk
  if (riskLevel === 'High') return 'Heightened risk outlook'
  if (riskLevel === 'Medium') return 'Balanced but watchful outlook'
  return 'More stable near-term outlook'
})

const scoreToneClass = (value: 'Low' | 'Medium' | 'High') => {
  if (value === 'High') return 'border-rose-200 bg-rose-50 text-rose-700'
  if (value === 'Medium') return 'border-amber-200 bg-amber-50 text-amber-700'
  return 'border-emerald-200 bg-emerald-50 text-emerald-700'
}

const aiTrendToneClass = (value: number) => {
  if (value >= 70) return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  if (value >= 40) return 'border-amber-200 bg-amber-50 text-amber-700'
  return 'border-rose-200 bg-rose-50 text-rose-700'
}

const formatCurrency = (value: number | null | undefined) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return '--'
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 })
}

const volatilityToneClass = computed(() => {
  const protection = props.intelligence.aiInsight?.volatilityStress.downsideProtection
  return scoreToneClass(protection === 'High' ? 'Low' : protection === 'Low' ? 'High' : 'Medium')
})

const insightCards = computed(() => {
  if (!props.intelligence.aiInsight) return []

  return [
    {
      key: 'sentiment',
      icon: 'heroicons:newspaper',
      iconWrapClass: 'bg-sky-50 text-sky-700',
      title: 'Sentiment & risk correlation',
      metric: `${props.intelligence.aiInsight.sentimentCorrelation.sentimentDivergenceScore}/100`,
      sublabel: aiDriverLabel.value,
      summary: props.intelligence.aiInsight.sentimentCorrelation.summary,
      toneLabel: '',
      toneClass: '',
      statTiles: [] as Array<{ label: string; value: string }>,
    },
    {
      key: 'structural',
      icon: 'heroicons:chart-bar-square',
      iconWrapClass: 'bg-emerald-50 text-emerald-700',
      title: 'Structural health check',
      metric: props.intelligence.aiInsight.structuralHealth.marketPhase,
      sublabel: '',
      summary: props.intelligence.aiInsight.structuralHealth.summary,
      toneLabel: `Trend sustainability ${props.intelligence.aiInsight.structuralHealth.trendSustainabilityScore}/100`,
      toneClass: aiTrendToneClass(props.intelligence.aiInsight.structuralHealth.trendSustainabilityScore),
      statTiles: [
        { label: 'Support', value: formatCurrency(props.intelligence.aiInsight.structuralHealth.supportLevel) },
        { label: 'Resistance', value: formatCurrency(props.intelligence.aiInsight.structuralHealth.resistanceLevel) },
      ],
    },
    {
      key: 'volatility',
      icon: 'heroicons:shield-exclamation',
      iconWrapClass: 'bg-rose-50 text-rose-700',
      title: 'Volatility stress test',
      metric: `${props.intelligence.aiInsight.volatilityStress.estimatedMaxDrawdownPercent.toFixed(2)}%`,
      sublabel: '',
      summary: props.intelligence.aiInsight.volatilityStress.summary,
      toneLabel: `Downside cushion ${props.intelligence.aiInsight.volatilityStress.downsideProtection}`,
      toneClass: volatilityToneClass.value,
      statTiles: [] as Array<{ label: string; value: string }>,
    },
  ]
})
</script>

<template>
  <article
    class="nf-ai-panel overflow-hidden rounded-[28px] border bg-[linear-gradient(135deg,rgba(255,249,237,0.98),rgba(241,246,231,0.92)_58%,rgba(232,241,249,0.85))] p-5 shadow-sm"
    :class="props.intelligence.aiInsight ? aiRiskLevelClass : 'border-[var(--nf-line)]'"
  >
    <div class="nf-ai-shell space-y-4">
      <div class="min-w-0">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--nf-muted)]">AI Insights</p>
            <h2 class="mt-2 text-2xl font-semibold tracking-tight">AI risk outlook</h2>
            <p class="mt-1 text-xs text-[var(--nf-muted)]">AI-generated interpretation</p>
          </div>
          <span class="rounded-full border border-white/70 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--nf-muted)] shadow-sm">
            {{ props.intelligence.aiInsight ? 'Updated now' : 'Unavailable' }}
          </span>
        </div>

        <div v-if="props.intelligence.aiInsight" class="mt-5 space-y-4">
          <div class="nf-ai-card rounded-[24px] px-4 py-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]">
            <div class="grid gap-4 lg:grid-cols-[290px_minmax(0,1fr)] lg:items-center">
              <div class="mx-auto flex w-full max-w-[320px] flex-col items-center px-1 py-1 text-center sm:px-2 sm:py-2">
                <div class="relative h-[236px] w-[236px] sm:h-[248px] sm:w-[248px]">
                  <svg viewBox="0 0 260 260" class="h-full w-full -rotate-90">
                    <defs>
                      <linearGradient id="nfAiGauge" x1="0%" y1="100%" x2="100%" y2="0%">
                        <stop offset="0%" stop-color="#14b86a" />
                        <stop offset="48%" stop-color="#f3c84d" />
                        <stop offset="100%" stop-color="#e45858" />
                      </linearGradient>
                    </defs>
                    <circle
                      cx="130"
                      cy="130"
                      r="68"
                      fill="none"
                      stroke="rgba(21,34,24,0.08)"
                      stroke-width="20"
                    />
                    <circle
                      class="nf-ai-gauge-arc"
                      cx="130"
                      cy="130"
                      r="68"
                      fill="none"
                      stroke="url(#nfAiGauge)"
                      stroke-width="20"
                      stroke-linecap="round"
                      :stroke-dasharray="aiRingCircumference"
                      :stroke-dashoffset="aiRingOffset"
                    />
                  </svg>

                  <div class="absolute inset-x-0 top-4 flex justify-center">
                    <span class="rounded-full border border-[var(--nf-line)] bg-white/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--nf-muted)]">
                      News vs Price
                    </span>
                  </div>

                  <div class="absolute inset-0 flex items-center justify-center px-14">
                    <div class="mt-2 flex items-end justify-center gap-1.5 rounded-full px-3 py-2">
                      <span class="text-[34px] font-bold leading-none tracking-tight sm:text-[42px]">
                        {{ props.intelligence.aiInsight.sentimentCorrelation.sentimentDivergenceScore }}
                      </span>
                      <span class="pb-0.5 text-xs font-semibold text-[var(--nf-muted)] sm:pb-1 sm:text-sm">/100</span>
                    </div>
                  </div>
                </div>

                <p class="max-w-[260px] px-1 text-center text-sm leading-6 text-[var(--nf-muted)]">
                  Shows how closely the latest price move matches the tone of recent headlines.
                </p>
              </div>

              <div class="w-full space-y-2.5">
                <div class="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  <div class="nf-ai-card-soft rounded-2xl p-3.5 text-left">
                    <p class="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--nf-muted)]">AI driver</p>
                    <div class="mt-2 flex items-center gap-2">
                      <span class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-sky-50 text-xs font-bold text-sky-700">N</span>
                      <p class="text-sm font-semibold capitalize">{{ aiDriverLabel }}</p>
                    </div>
                  </div>
                  <div class="nf-ai-card-soft rounded-2xl p-3.5 text-left">
                    <p class="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--nf-muted)]">AI confidence</p>
                    <div class="mt-2 flex items-center gap-2">
                      <span class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-violet-50 text-xs font-bold text-violet-700">C</span>
                      <p class="text-sm font-semibold">{{ props.intelligence.aiInsight.confidence }}</p>
                    </div>
                  </div>
                </div>

                <div class="nf-ai-card-soft overflow-hidden rounded-2xl">
                  <div class="flex h-2">
                    <div class="h-full w-1/3 bg-emerald-500" />
                    <div class="h-full w-1/3 bg-amber-400" />
                    <div class="h-full w-1/3 bg-rose-500" />
                  </div>
                  <div class="flex items-center justify-between px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--nf-muted)]">
                    <span>Stable</span>
                    <span>Elevated</span>
                    <span>Stress</span>
                  </div>
                </div>

                <div class="rounded-2xl border p-3.5 text-left" :class="scoreToneClass(props.intelligence.aiInsight.sentimentCorrelation.divergenceRisk)">
                  <p class="text-[11px] font-semibold uppercase tracking-[0.14em]">AI read</p>
                  <p class="mt-1.5 text-sm font-semibold">{{ props.intelligence.aiInsight.sentimentCorrelation.divergenceRisk }} mismatch risk</p>
                </div>
              </div>
            </div>
          </div>

          <div class="nf-ai-card rounded-[24px] p-4">
            <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p class="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--nf-muted)]">AI summary</p>
                <h3 class="mt-1.5 text-xl font-semibold">{{ aiSummaryHeading }}</h3>
              </div>
              <span class="rounded-full px-3 py-1 text-xs font-semibold shadow-sm" :class="scoreToneClass(props.intelligence.aiInsight.sentimentCorrelation.divergenceRisk)">
                {{ props.intelligence.aiInsight.sentimentCorrelation.divergenceRisk }}
              </span>
            </div>
            <p class="nf-ai-summary-copy mt-3 text-sm leading-6 text-[var(--nf-muted)]">{{ props.intelligence.aiInsight.sentimentCorrelation.summary }}</p>
          </div>
        </div>

        <div v-else class="mt-6 rounded-[24px] border border-white/70 bg-white/55 p-5 text-sm text-[var(--nf-muted)] shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] backdrop-blur-sm">
          Risk analysis is not available right now.
        </div>
      </div>

      <div class="min-w-0">
        <div v-if="props.intelligence.aiInsight" class="space-y-4">
          <div class="nf-ai-compare-grid">
            <div
              v-for="card in insightCards"
              :key="card.key"
              class="nf-ai-compare-card rounded-[24px] p-4"
            >
              <div class="flex items-start gap-3">
                  <span class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl" :class="card.iconWrapClass">
                    <Icon :name="card.icon" size="20" />
                  </span>
                <div class="min-w-0">
                  <p class="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--nf-muted)]">{{ card.title }}</p>
                  <p class="mt-0.5 text-lg font-semibold">{{ card.metric }}</p>
                </div>
              </div>
                  <span
                    v-if="card.toneLabel || card.sublabel"
                    class="mt-2 inline-flex self-start rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.1em]"
                    :class="card.toneClass"
                  >
                    {{ card.sublabel || card.toneLabel }}
                </span>

              <div v-if="card.statTiles.length" class="nf-ai-stat-grid mt-3 text-sm">
                <div
                  v-for="tile in card.statTiles"
                  :key="tile.label"
                  class="nf-ai-stat-tile rounded-xl p-2.5"
                >
                  <p class="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--nf-muted)]">{{ tile.label }}</p>
                  <p class="mt-1 font-semibold">{{ tile.value }}</p>
                </div>
              </div>

              <p class="mt-3 text-sm leading-6 text-[var(--nf-muted)]">{{ card.summary }}</p>
            </div>
          </div>

          <div class="nf-ai-card rounded-[24px] p-4">
            <p class="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--nf-muted)]">Key takeaways</p>
            <div class="mt-3 grid gap-3 md:grid-cols-2">
              <div
                v-for="(item, index) in props.intelligence.aiInsight.signals"
                :key="item"
                class="nf-ai-evidence-card group rounded-2xl px-4 py-3.5"
              >
                <div class="flex gap-3 pl-2">
                  <span class="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--nf-ink)] text-xs font-semibold text-white shadow-sm">
                    {{ index + 1 }}
                  </span>
                  <div class="min-w-0">
                    <p class="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--nf-muted)]">Takeaway {{ index + 1 }}</p>
                    <p class="mt-1 text-sm leading-6 text-[var(--nf-ink)]">{{ item }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="nf-ai-card rounded-[24px] p-5 text-sm text-[var(--nf-muted)]">
          This page still shows price, news, and earnings details even when the market read is unavailable.
        </div>
      </div>
    </div>
  </article>
</template>
