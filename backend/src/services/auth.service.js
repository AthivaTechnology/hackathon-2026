const crypto = require('crypto')
const prisma = require('../config/prisma')
const { hashPassword, comparePassword } = require('../utils/password')
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/jwt')
const AppError = require('../utils/AppError')
const env = require('../config/env')
const { sendPasswordReset } = require('../utils/email')

const REFRESH_TOKEN_TTL_DAYS = 7

const register = async ({ name, email, password }) => {
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) throw new AppError('Email already in use', 409)

  const passwordHash = await hashPassword(password)
  try {
    const user = await prisma.user.create({
      data: { name, email, passwordHash },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    })
    return user
  } catch (err) {
    // Check for Prisma unique constraint violation (P2002)
    if (err.code === 'P2002' && err.meta?.target?.includes('email')) {
      throw new AppError('Email already in use', 409)
    }
    throw err
  }
}

const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) throw new AppError('Invalid credentials', 401)

  const valid = await comparePassword(password, user.passwordHash)
  if (!valid) throw new AppError('Invalid credentials', 401)

  const payload = { userId: user.id, role: user.role }
  const accessToken = signAccessToken(payload)
  const refreshToken = signRefreshToken(payload)

  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_TTL_DAYS)

  await prisma.refreshToken.create({
    data: { token: refreshToken, userId: user.id, expiresAt },
  })

  return {
    accessToken,
    refreshToken,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  }
}

const refresh = async (token) => {
  if (!token) throw new AppError('Refresh token required', 401)

  let payload
  try {
    payload = verifyRefreshToken(token)
  } catch {
    throw new AppError('Invalid or expired refresh token', 401)
  }

  const stored = await prisma.refreshToken.findUnique({ where: { token } })
  if (!stored || stored.expiresAt < new Date()) {
    throw new AppError('Refresh token expired or revoked', 401)
  }

  const user = await prisma.user.findUnique({ where: { id: payload.userId } })
  if (!user) throw new AppError('User not found', 401)

  const newAccessToken = signAccessToken({ userId: user.id, role: user.role })
  const newRefreshToken = signRefreshToken({ userId: user.id, role: user.role })

  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_TTL_DAYS)

  await prisma.refreshToken.delete({ where: { token } })
  await prisma.refreshToken.create({
    data: { token: newRefreshToken, userId: user.id, expiresAt },
  })

  return { accessToken: newAccessToken, refreshToken: newRefreshToken }
}

const logout = async (token) => {
  if (!token) return
  await prisma.refreshToken.deleteMany({ where: { token } })
}

const forgotPassword = async (email) => {
  const user = await prisma.user.findUnique({ where: { email } })
  // Always respond the same way to avoid email enumeration
  if (!user) return

  // Invalidate any existing tokens for this user
  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } })

  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000) // 30 minutes

  await prisma.passwordResetToken.create({
    data: { token, userId: user.id, expiresAt },
  })

  const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${token}`
  await sendPasswordReset(user.email, resetUrl)
}

const resetPassword = async (token, newPassword) => {
  const record = await prisma.passwordResetToken.findUnique({ where: { token } })
  if (!record || record.expiresAt < new Date()) {
    throw new AppError('Reset link is invalid or has expired', 400)
  }

  const passwordHash = await hashPassword(newPassword)
  await prisma.user.update({ where: { id: record.userId }, data: { passwordHash } })
  await prisma.passwordResetToken.delete({ where: { token } })
}

module.exports = { register, login, refresh, logout, forgotPassword, resetPassword }
