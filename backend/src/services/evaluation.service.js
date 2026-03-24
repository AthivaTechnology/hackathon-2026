const prisma = require('../config/prisma')
const AppError = require('../utils/AppError')

const validateScores = (scores) => {
  for (const [key, val] of Object.entries(scores)) {
    if (val < 1 || val > 10) throw new AppError(`${key} must be between 1 and 10`, 400)
  }
}

const createEvaluation = async (submissionId, judgeId, data) => {
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: { hackathon: true },
  })
  if (!submission) throw new AppError('Submission not found', 404)

  const { status } = submission.hackathon
  if (status === 'PENDING' || status === 'ACTIVE') {
    throw new AppError('Evaluations can only be submitted after the submission deadline', 403)
  }
  if (status === 'COMPLETED') {
    throw new AppError('Hackathon is completed, evaluations are locked', 403)
  }

  if (submission.userId === judgeId) {
    throw new AppError('Cannot evaluate your own submission', 403)
  }

  const { innovationScore, impactScore, technicalScore, feedback } = data
  validateScores({ innovationScore, impactScore, technicalScore })

  const existing = await prisma.evaluation.findUnique({
    where: { submissionId_judgeId: { submissionId, judgeId } },
  })
  if (existing) throw new AppError('You have already evaluated this submission', 409)

  return prisma.evaluation.create({
    data: {
      submissionId,
      judgeId,
      innovationScore,
      impactScore,
      technicalScore,
      feedback: feedback || null,
    },
    include: { judge: { select: { id: true, name: true } } },
  })
}

const updateEvaluation = async (id, judgeId, data) => {
  const evaluation = await prisma.evaluation.findUnique({
    where: { id },
    include: { submission: { include: { hackathon: true } } },
  })
  if (!evaluation) throw new AppError('Evaluation not found', 404)
  if (evaluation.judgeId !== judgeId) throw new AppError('Not authorized', 403)

  if (evaluation.submission.hackathon.status === 'COMPLETED') {
    throw new AppError('Hackathon is completed, evaluations are locked', 403)
  }

  const { innovationScore, impactScore, technicalScore, feedback } = data
  const scores = {}
  if (innovationScore !== undefined) scores.innovationScore = innovationScore
  if (impactScore !== undefined) scores.impactScore = impactScore
  if (technicalScore !== undefined) scores.technicalScore = technicalScore
  if (Object.keys(scores).length) validateScores(scores)

  return prisma.evaluation.update({
    where: { id },
    data: {
      ...scores,
      ...(feedback !== undefined && { feedback: feedback || null }),
    },
    include: { judge: { select: { id: true, name: true } } },
  })
}

module.exports = { createEvaluation, updateEvaluation }
