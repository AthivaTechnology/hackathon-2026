const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500
  const isOperational = err.isOperational || false

  // Log non-operational errors (including Prisma/DB errors)
  if (!isOperational) {
    console.error(' [Unexpected Error]:', {
      message: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
    })
  }

  const message = isOperational ? err.message : 'Internal server error'
  res.status(statusCode).json({ error: message })
}

module.exports = errorHandler
