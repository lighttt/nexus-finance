import cors from 'cors'
import express from 'express'
import publicRoutes from './presentation/http/routes/public.routes'

const app = express()

app.use(cors())
app.use(express.json())

app.get('/', (_req, res) => {
  res.json({ message: 'Nexus Finance API is running' })
})

app.use('/api/public', publicRoutes)

export default app
