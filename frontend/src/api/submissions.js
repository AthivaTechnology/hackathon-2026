import client from './client'

export const getSubmission = (id) => client.get(`/submissions/${id}`)
export const updateSubmission = (id, data) => client.patch(`/submissions/${id}`, data)
