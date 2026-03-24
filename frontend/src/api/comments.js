import client from './client'

export const listComments = (submissionId) =>
  client.get(`/submissions/${submissionId}/comments`)
export const createComment = (submissionId, content) =>
  client.post(`/submissions/${submissionId}/comments`, { content })
