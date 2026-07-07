import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import cors from 'cors'
import express from 'express'

import authRoutes from './routes/authRoutes.js'
import userRoutes from './routes/userRoutes.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
const staticPath = resolve(__dirname, '../public')

app.use(
  cors({
    origin: '*',
  })
)
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.get('/api', (req, res) => {
  res.json({
    message: 'MiitVerse API root',
    routes: ['/api/health', '/api/auth', '/api/users'],
  })
})

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)

// Serve frontend build assets
app.use(express.static(staticPath))

app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    return res.sendFile(resolve(staticPath, 'index.html'))
  }
  next()
})

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' })
})

export default app