const authService = require('../services/auth.service')

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
}

const sendOtp = async (req, res, next) => {
  try {
    await authService.sendOtp(req.body.email)
    res.json({ message: 'Check your email for the login code.' })
  } catch (err) {
    next(err)
  }
}

const verifyOtp = async (req, res, next) => {
  try {
    const { accessToken, refreshToken, user } = await authService.verifyOtp(req.body.email, req.body.code)
    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS)
    res.json({ accessToken, user })
  } catch (err) {
    next(err)
  }
}

const updateProfile = async (req, res, next) => {
  try {
    const user = await authService.updateProfile(req.user.userId, req.body.name)
    res.json({ user })
  } catch (err) {
    next(err)
  }
}

const refresh = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken
    const { accessToken, refreshToken } = await authService.refresh(token)
    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS)
    res.json({ accessToken })
  } catch (err) {
    next(err)
  }
}

const logout = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken
    await authService.logout(token)
    res.clearCookie('refreshToken')
    res.json({ message: 'Logged out' })
  } catch (err) {
    next(err)
  }
}

module.exports = { sendOtp, verifyOtp, updateProfile, refresh, logout }
