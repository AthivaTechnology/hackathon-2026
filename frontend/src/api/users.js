import client from './client'

export const listUsers = () => client.get('/users')
export const updateUser = (id, data) => client.patch(`/users/${id}`, data)
export const deleteUser = (id) => client.delete(`/users/${id}`)
export const resetPassword = (id, newPassword) =>
  client.post(`/users/${id}/reset-password`, { newPassword })
