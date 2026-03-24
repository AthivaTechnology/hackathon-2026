const hackathonService = require('../services/hackathon.service')

const createHackathon = async (req, res, next) => {
  try {
    const hackathon = await hackathonService.createHackathon(req.body, req.user.userId)
    res.status(201).json({ hackathon })
  } catch (err) {
    next(err)
  }
}

const listHackathons = async (req, res, next) => {
  try {
    const hackathons = await hackathonService.listHackathons()
    res.json({ hackathons })
  } catch (err) {
    next(err)
  }
}

const getHackathon = async (req, res, next) => {
  try {
    const hackathon = await hackathonService.getHackathon(req.params.id)
    res.json({ hackathon })
  } catch (err) {
    next(err)
  }
}

const announceResults = async (req, res, next) => {
  try {
    const hackathon = await hackathonService.announceResults(req.params.id, req.user.userId)
    res.json({ hackathon, message: 'Results announced successfully' })
  } catch (err) {
    next(err)
  }
}

const getLeaderboard = async (req, res, next) => {
  try {
    const leaderboard = await hackathonService.getLeaderboard(req.params.id)
    res.json({ leaderboard })
  } catch (err) {
    next(err)
  }
}

const getFeatured = async (req, res, next) => {
  try {
    const hackathon = await hackathonService.getFeatured()
    res.json({ hackathon })
  } catch (err) {
    next(err)
  }
}

const getCurrent = async (req, res, next) => {
  try {
    const hackathon = await hackathonService.getCurrent()
    res.json({ hackathon })
  } catch (err) {
    next(err)
  }
}

module.exports = { createHackathon, listHackathons, getHackathon, announceResults, getLeaderboard, getFeatured, getCurrent }
