import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import { rateLimit } from 'express-rate-limit'

import authRoutes from './routes/auth.routes'
import mangaRoutes from './routes/manga.routes'
import chapterRoutes from './routes/chapter.routes'
import coinRoutes from './routes/coin.routes'
import commentRoutes from './routes/comment.routes'
import ratingRoutes from './routes/rating.routes'
import userRoutes from './routes/user.routes'
import uploadRoutes from './routes/upload.routes'
import adminRoutes from './routes/admin.routes'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Juda ko\'p so\'rovlar. 15 daqiqadan keyin urinib ko\'ring.' }
})
app.use('/api', limiter)

// Static files
app.use('/uploads', express.static('uploads'))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/mangas', mangaRoutes)
app.use('/api/chapters', chapterRoutes)
app.use('/api/coins', coinRoutes)
app.use('/api/comments', commentRoutes)
app.use('/api/ratings', ratingRoutes)
app.use('/api/users', userRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/admin', adminRoutes)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'MangaPro API ishlayapti' })
})

// 404
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Yo\'l topilmadi' })
})

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack)
  res.status(err.status || 500).json({
    error: err.message || 'Server xatosi'
  })
})

app.listen(PORT, () => {
  console.log(`✅ MangaPro server ${PORT} portda ishlamoqda`)
})

export default app
