const submissionService = require('../services/submission.service')

const createSubmission = async (req, res, next) => {
  try {
    const submission = await submissionService.createSubmission(
      req.params.hackathonId,
      req.user.userId,
      req.body
    )
    res.status(201).json({ submission })
  } catch (err) {
    next(err)
  }
}

const listSubmissions = async (req, res, next) => {
  try {
    const submissions = await submissionService.listSubmissions(req.params.hackathonId)
    res.json({ submissions })
  } catch (err) {
    next(err)
  }
}

const getSubmission = async (req, res, next) => {
  try {
    const submission = await submissionService.getSubmission(req.params.id, req.user)
    res.json({ submission })
  } catch (err) {
    next(err)
  }
}

const updateSubmission = async (req, res, next) => {
  try {
    const submission = await submissionService.updateSubmission(
      req.params.id,
      req.user.userId,
      req.body
    )
    res.json({ submission })
  } catch (err) {
    next(err)
  }
}

module.exports = { createSubmission, listSubmissions, getSubmission, updateSubmission }
