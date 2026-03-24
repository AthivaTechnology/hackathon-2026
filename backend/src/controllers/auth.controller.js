const authService = require('../services/auth.service')

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
}

const register = async (req, res, next) => {
  try {
    const user = await authService.register(req.body)
    res.status(201).json({ user })
  } catch (err) {
    next(err)
  }
}

const login = async (req, res, next) => {
  try {
    const { accessToken, refreshToken, user } = await authService.login(req.body)
    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS)
    res.json({ accessToken, user })
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

module.exports = { register, login, refresh, logout }
