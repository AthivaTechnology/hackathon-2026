const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const env = require('./config/env')
const errorHandler = require('./middleware/errorHandler')

const authRoutes = require('./routes/auth.routes')
const userRoutes = require('./routes/user.routes')
const hackathonRoutes = require('./routes/hackathon.routes')
const submissionRoutes = require('./routes/submission.routes')
const { router: evaluationRoutes } = require('./routes/evaluation.routes')
const commentRoutes = require('./routes/comment.routes')

const app = express()

app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
}))
app.use(express.json())
app.use(cookieParser())

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/hackathons', hackathonRoutes)
app.use('/api/submissions', submissionRoutes)
app.use('/api/evaluations', evaluationRoutes)
app.use('/api', commentRoutes)

app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

app.use(errorHandler)

module.exports = app
