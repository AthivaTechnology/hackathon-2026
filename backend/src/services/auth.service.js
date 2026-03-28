const prisma = require('../config/prisma')
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/jwt')
const AppError = require('../utils/AppError')
const { sendOtpEmail } = require('../utils/email')

const REFRESH_TOKEN_TTL_DAYS = 7
const OTP_TTL_MINUTES = 10

const sendOtp = async (email) => {
  if (!email.endsWith('@athivatech.com')) {
    throw new AppError('Only @athivatech.com email addresses are allowed', 400)
  }

  await prisma.otpToken.deleteMany({ where: { email } })

  const code = String(Math.floor(100000 + Math.random() * 900000))
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000)

  await prisma.otpToken.create({ data: { email, code, expiresAt } })
  await sendOtpEmail(email, code)
}

const verifyOtp = async (email, code) => {
  const record = await prisma.otpToken.findFirst({ where: { email, code } })
  if (!record || record.expiresAt < new Date()) {
    throw new AppError('Invalid or expired code', 400)
  }

  await prisma.otpToken.delete({ where: { id: record.id } })

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email },
    select: { id: true, name: true, email: true, role: true },
  })

  const payload = { userId: user.id, role: user.role }
  const accessToken = signAccessToken(payload)
  const refreshToken = signRefreshToken(payload)

  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_TTL_DAYS)

  await prisma.refreshToken.create({
    data: { token: refreshToken, userId: user.id, expiresAt },
  })

  return { accessToken, refreshToken, user }
}

const updateProfile = async (userId, name) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { name },
    select: { id: true, name: true, email: true, role: true },
  })
  return user
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

module.exports = { sendOtp, verifyOtp, updateProfile, refresh, logout }
