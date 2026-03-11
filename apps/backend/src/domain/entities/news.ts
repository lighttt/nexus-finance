export interface NewsArticle {
  title: string
  summary: string
  readMoreLink: string
  source: string
  datetime: number
  image: string | null
}

export interface LatestNews {
  news: NewsArticle[]
}
