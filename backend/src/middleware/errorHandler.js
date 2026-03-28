const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500
  const message = err.isOperational ? err.message : 'Internal server error'

  if (process.env.NODE_ENV !== 'production' && !err.isOperational) {
    console.error(err)
  }

  res.status(statusCode).json({ error: message })
}

module.exports = errorHandler
