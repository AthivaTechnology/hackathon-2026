import client from './client'

export const createEvaluation = (submissionId, data) =>
  client.post(`/submissions/${submissionId}/evaluations`, data)
export const updateEvaluation = (id, data) => client.patch(`/evaluations/${id}`, data)
