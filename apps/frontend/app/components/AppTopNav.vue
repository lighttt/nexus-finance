<script setup lang="ts">
interface MarketStatusResponse {
  exchange: string
  isOpen: boolean
  session: string | null
  timestamp: number
  timezone: string
}

const config = useRuntimeConfig()
const route = useRoute()
const marketStatus = ref<MarketStatusResponse | null>(null)
const loadingStatus = ref(true)
const statusError = ref(false)

const links = [
  { label: 'Dashboard', to: '/' },
  { label: 'Full Table', to: '/market' },
  { label: 'All News', to: '/news' },
]

const isActiveRoute = (path: string): boolean => {
  if (path === '/') return route.path === '/'
  return route.path === path || route.path.startsWith(`${path}/`)
}

const loadMarketStatus = async () => {
  if (!config.public.apiBase) {
    statusError.value = true
    loadingStatus.value = false
    return
  }

  try {
    const data = await $fetch<MarketStatusResponse>(`${config.public.apiBase}/market-status`)
    marketStatus.value = data
    statusError.value = false
  } catch {
    statusError.value = true
  } finally {
    loadingStatus.value = false
  }
}

let refreshTimer: ReturnType<typeof setInterval> | null = null

onMounted(async () => {
  await loadMarketStatus()
  refreshTimer = setInterval(() => {
    void loadMarketStatus()
  }, 60_000)
})

onUnmounted(() => {
  if (refreshTimer) clearInterval(refreshTimer)
})
</script>

<template>
  <header class="sticky top-0 z-30 border-b border-[var(--nf-line)] bg-[var(--nf-surface)]/90 backdrop-blur">
    <nav class="mx-auto flex min-h-16 w-full max-w-6xl items-center justify-between px-4 py-2 sm:px-6 lg:px-8">
      <div class="flex items-center gap-6">
        <NuxtLink to="/" class="text-sm font-bold uppercase tracking-[0.2em] text-[var(--nf-ink)]">
          Nexus Finance
        </NuxtLink>
      </div>

      <div class="flex items-center gap-3">
        <ClerkLoaded>
          <Show when="signed-in">
            <div class="hidden items-center gap-2 sm:flex">
              <NuxtLink
                v-for="link in links"
                :key="link.to"
                :to="link.to"
                class="rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors"
                :class="
                  isActiveRoute(link.to)
                    ? 'bg-[var(--nf-ink)] text-white'
                    : 'text-[var(--nf-muted)] hover:bg-white hover:text-[var(--nf-ink)]'
                "
              >
                {{ link.label }}
              </NuxtLink>
            </div>

            <div
              class="rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.08em]"
              :class="
                loadingStatus
                  ? 'border-slate-200 bg-slate-50 text-slate-500'
                  : statusError
                    ? 'border-amber-200 bg-amber-50 text-amber-700'
                    : marketStatus?.isOpen
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border-rose-200 bg-rose-50 text-rose-700'
              "
            >
              {{
                loadingStatus
                  ? 'Market: Checking'
                  : statusError
                    ? 'Market: Status unavailable'
                    : marketStatus?.isOpen
                      ? 'Market: Open'
                      : 'Market: Closed'
              }}
            </div>
          </Show>

          <div class="flex items-center gap-2">
            <Show when="signed-out">
              <SignInButton mode="modal">
                <button
                  class="rounded-lg border border-[var(--nf-line)] bg-white px-3 py-1.5 text-sm font-medium hover:bg-slate-50"
                >
                  Sign in
                </button>
              </SignInButton>
            </Show>
            <Show when="signed-in">
              <UserButton />
            </Show>
          </div>
        </ClerkLoaded>
      </div>
    </nav>

    <ClerkLoaded>
      <Show when="signed-in">
        <div class="border-t border-[var(--nf-line)] px-4 py-2 sm:hidden">
          <div class="flex items-center gap-2">
            <NuxtLink
              v-for="link in links"
              :key="`mobile-${link.to}`"
              :to="link.to"
              class="rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors"
              :class="
                isActiveRoute(link.to)
                  ? 'bg-[var(--nf-ink)] text-white'
                  : 'bg-white text-[var(--nf-muted)] hover:text-[var(--nf-ink)]'
              "
            >
              {{ link.label }}
            </NuxtLink>
          </div>
        </div>
      </Show>
    </ClerkLoaded>
  </header>
</template>
