import { createError, defineEventHandler, getQuery } from 'h3'

interface NasdaqSymbolDto {
  symbol: string
  displaySymbol: string
  description: string
  type: string
  mic: string
}

interface NasdaqSymbolsDto {
  symbols: NasdaqSymbolDto[]
}

export default defineEventHandler(async (event) => {
  const auth = event.context.auth()
  const { isAuthenticated } = auth

  if (!isAuthenticated) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  const config = useRuntimeConfig()
  const query = getQuery(event)
  const limit = typeof query.limit === 'string' ? query.limit : '200'

  if (!config.public.apiProtectedBase) {
    throw createError({
      statusCode: 500,
      statusMessage: 'NUXT_PUBLIC_API_PROTECTED_BASE is not configured',
    })
  }

  const token = await auth.getToken()
  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  return await $fetch<NasdaqSymbolsDto>(`${config.public.apiProtectedBase}/symbols`, {
    headers: { Authorization: `Bearer ${token}` },
    params: { limit },
  })
})
