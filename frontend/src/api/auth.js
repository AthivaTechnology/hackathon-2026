import client from './client'

export const sendOtp = (email) => client.post('/auth/send-otp', { email })
export const verifyOtp = (email, code) => client.post('/auth/verify-otp', { email, code })
export const updateProfile = (name) => client.patch('/auth/profile', { name })
export const logout = () => client.post('/auth/logout')
