<script setup lang="ts">
import type { Header } from 'vue3-easy-data-table'
// eslint-ts-ignore @typescript-eslint/no-default-export
// @ts-expect-error
import EasyDataTable from 'vue3-easy-data-table'

definePageMeta({
  middleware: ['auth'],
})

interface NasdaqSymbol {
  symbol: string
  displaySymbol: string
  description: string
  type: string
  mic: string
}

interface NasdaqTableResponse {
  symbols: NasdaqSymbol[]
}

const { isLoaded, isSignedIn } = useUser()
const search = ref('')
const headers: Header[] = [
  { text: 'Symbol', value: 'symbol', sortable: true },
  { text: 'Display', value: 'displaySymbol', sortable: true },
  { text: 'Description', value: 'description', sortable: true },
  { text: 'Type', value: 'type', sortable: true },
]

const {
  data: table,
  pending,
  error,
  refresh,
} = useFetch<NasdaqTableResponse>('/api/nasdaq-table', {
  query: { limit: 300 },
  server: false,
  lazy: true,
})

const tableLoading = computed(() => pending.value || (!table.value && !error.value))

const filteredSymbols = computed(() => {
  const source = table.value?.symbols ?? []
  const query = search.value.trim().toLowerCase()

  if (!query) {
    return source
  }

  return source.filter((item) => {
    return (
      item.symbol.toLowerCase().includes(query) ||
      item.displaySymbol.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query)
    )
  })
})

const openSymbolDetail = (item: NasdaqSymbol) => {
  const symbol = encodeURIComponent(item.symbol)
  return navigateTo(`/market/${symbol}`)
}
</script>

<template>
  <main class="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
    <section class="rounded-3xl border border-[var(--nf-line)] bg-white/65 px-6 py-7 backdrop-blur-sm">
      <div>
        <h1 class="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Full NASDAQ Table</h1>
        <p class="mt-2 max-w-2xl text-sm text-[var(--nf-muted)]">
          Access detailed information on all NASDAQ-listed companies. Search by symbol, name, or description to find
          the data you need.
        </p>
      </div>

      <div class="mt-5">
        <label class="block text-xs font-semibold uppercase tracking-[0.14em] text-[var(--nf-muted)]" for="symbolSearch">
          Search symbols
        </label>
        <input
          id="symbolSearch"
          v-model="search"
          type="text"
          placeholder="AAPL, MSFT, Tesla..."
          class="mt-2 w-full rounded-xl border border-[var(--nf-line)] bg-white px-3 py-2 text-sm outline-none ring-0 focus:border-[var(--nf-ink)]"
        />
      </div>
    </section>

    <section class="mt-4 rounded-2xl border border-[var(--nf-line)] bg-[var(--nf-surface)] p-4 shadow-sm">
      <div v-if="error" class="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800">
        <p class="font-semibold">Unable to load protected NASDAQ table.</p>
        <button
          class="mt-3 rounded-lg border border-rose-300 px-3 py-1.5 text-sm font-medium hover:bg-rose-100"
          @click="refresh()"
        >
          Retry
        </button>
      </div>

      <div v-else>
        <p class="mb-3 text-xs text-[var(--nf-muted)]">
          Showing {{ filteredSymbols.length }} symbols
        </p>

        <div v-if="tableLoading" class="space-y-2 rounded-xl border border-[var(--nf-line)] bg-white/70 p-3">
          <div v-for="i in 8" :key="`table-loading-${i}`" class="grid grid-cols-4 gap-3">
            <div class="nf-shimmer h-5 rounded-md" />
            <div class="nf-shimmer h-5 rounded-md" />
            <div class="nf-shimmer h-5 rounded-md" />
            <div class="nf-shimmer h-5 rounded-md" />
          </div>
        </div>

        <ClientOnly v-else>
          <EasyDataTable
            class="nf-data-table"
            :headers="headers"
            :items="filteredSymbols"
            :loading="tableLoading"
            fixed-header
            :table-height="560"
            table-class-name="customize-table"
            body-row-class-name="nf-clickable-row"
            header-text-direction="left"
            body-text-direction="left"
            alternating
            buttons-pagination
            rows-per-page-message="Rows per page"
            rows-of-page-separator-message="of"
            :rows-per-page="15"
            :rows-items="[15, 30, 50]"
            @click-row="openSymbolDetail"
          >
            <template #loading>
              <div class="space-y-2 p-3">
                <div v-for="i in 8" :key="`loading-${i}`" class="grid grid-cols-4 gap-3">
                  <div class="nf-shimmer h-5 rounded-md" />
                  <div class="nf-shimmer h-5 rounded-md" />
                  <div class="nf-shimmer h-5 rounded-md" />
                  <div class="nf-shimmer h-5 rounded-md" />
                </div>
              </div>
            </template>
          </EasyDataTable>
        </ClientOnly>
      </div>
    </section>
  </main>
</template>
