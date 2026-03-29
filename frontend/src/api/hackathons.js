import client from './client'
import axios from 'axios'

export const getFeatured = () => axios.get('/api/hackathons/featured')
export const getCurrentHackathon = () => client.get('/hackathons/current')
export const announceResults = (id) => client.post(`/hackathons/${id}/announce`)
export const getLeaderboard = (id) => client.get(`/hackathons/${id}/leaderboard`)
export const listSubmissions = (hackathonId) => client.get(`/hackathons/${hackathonId}/submissions`)
export const createSubmission = (hackathonId, data) =>
  client.post(`/hackathons/${hackathonId}/submissions`, data)
export const toggleLike = (submissionId) => client.post(`/submissions/${submissionId}/like`)
