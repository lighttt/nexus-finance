import cors from 'cors'
import express from 'express'
import publicRoutes from './modules/public/public.routes'
import protectedRoutes from './modules/protected/protected.routes'

const app = express()

app.use(cors())
app.use(express.json())

app.get('/', (_req, res) => {
  res.json({ message: 'Nexus Finance API is running' })
})

app.use('/api/public', publicRoutes)
app.use('/api/protected', protectedRoutes)

export default app
