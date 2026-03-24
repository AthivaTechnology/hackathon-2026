const evaluationService = require('../services/evaluation.service')

const createEvaluation = async (req, res, next) => {
  try {
    const evaluation = await evaluationService.createEvaluation(
      req.params.submissionId,
      req.user.userId,
      req.body
    )
    res.status(201).json({ evaluation })
  } catch (err) {
    next(err)
  }
}

const updateEvaluation = async (req, res, next) => {
  try {
    const evaluation = await evaluationService.updateEvaluation(
      req.params.id,
      req.user.userId,
      req.body
    )
    res.json({ evaluation })
  } catch (err) {
    next(err)
  }
}

module.exports = { createEvaluation, updateEvaluation }
