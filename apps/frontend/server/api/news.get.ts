import { createError, defineEventHandler, getQuery } from 'h3'

interface NewsItemDto {
  title: string
  summary: string
  readMoreLink: string
  source: string
  datetime: number
  image: string | null
  related: string
  category: string
}

interface NewsResponseDto {
  news: NewsItemDto[]
  page: number
  limit: number
  total: number
  hasMore: boolean
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

  const token = await auth.getToken()
  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  const config = useRuntimeConfig()
  if (!config.public.apiProtectedBase) {
    throw createError({
      statusCode: 500,
      statusMessage: 'NUXT_PUBLIC_API_PROTECTED_BASE is not configured',
    })
  }

  const query = getQuery(event)
  const page = typeof query.page === 'string' ? query.page : '1'
  const limit = typeof query.limit === 'string' ? query.limit : '10'

  return await $fetch<NewsResponseDto>(`${config.public.apiProtectedBase}/news`, {
    headers: { Authorization: `Bearer ${token}` },
    params: { page, limit },
  })
})
