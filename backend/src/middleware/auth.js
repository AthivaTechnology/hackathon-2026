const { verifyAccessToken } = require('../utils/jwt')
const AppError = require('../utils/AppError')

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return next(new AppError('Authentication required', 401))
  }

  const token = authHeader.split(' ')[1]
  try {
    req.user = verifyAccessToken(token)
    next()
  } catch {
    next(new AppError('Invalid or expired token', 401))
  }
}

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) return next(new AppError('Authentication required', 401))
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Insufficient permissions', 403))
    }
    next()
  }
}

module.exports = { verifyToken, requireRole }
