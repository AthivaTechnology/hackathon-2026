import client from './client'
import axios from 'axios'

export const register = (data) => client.post('/auth/register', data)
export const login = (data) => client.post('/auth/login', data)
export const logout = () => client.post('/auth/logout')
export const forgotPassword = (email) => client.post('/auth/forgot-password', { email })
export const resetPassword = (token, password) => client.post('/auth/reset-password', { token, password })
