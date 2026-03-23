export const env = {
  port: Number(process.env.PORT) || 4000,
  finnhubApiKey: process.env.FINNHUB_API_KEY ?? '',
  clerkSecretKey: process.env.CLERK_SECRET_KEY ?? '',
  awsRegion: process.env.AWS_REGION ?? '',
  awsBearerTokenBedrock: process.env.AWS_BEARER_TOKEN_BEDROCK ?? '',
}
