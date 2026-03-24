const prisma = require('../config/prisma')
const AppError = require('../utils/AppError')

const createHackathon = async (data, userId) => {
  const { title, description, startTime, submissionDeadline } = data

  const start = new Date(startTime)
  const deadline = new Date(submissionDeadline)

  if (isNaN(start) || isNaN(deadline)) throw new AppError('Invalid date format', 400)
  if (deadline <= start) throw new AppError('Submission deadline must be after start time', 400)

  return prisma.hackathon.create({
    data: {
      title,
      description,
      startTime: start,
      submissionDeadline: deadline,
      createdById: userId,
    },
    include: { createdBy: { select: { id: true, name: true } } },
  })
}

const listHackathons = async () => {
  return prisma.hackathon.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      createdBy: { select: { id: true, name: true } },
      _count: { select: { submissions: true } },
    },
  })
}

const getHackathon = async (id) => {
  const hackathon = await prisma.hackathon.findUnique({
    where: { id },
    include: {
      createdBy: { select: { id: true, name: true } },
      _count: { select: { submissions: true } },
    },
  })
  if (!hackathon) throw new AppError('Hackathon not found', 404)
  return hackathon
}

const announceResults = async (id, userId) => {
  const hackathon = await prisma.hackathon.findUnique({ where: { id } })
  if (!hackathon) throw new AppError('Hackathon not found', 404)
  if (hackathon.status === 'COMPLETED') throw new AppError('Results already announced', 400)
  if (hackathon.status === 'PENDING' || hackathon.status === 'ACTIVE') {
    throw new AppError('Cannot announce results before submission deadline', 400)
  }

  return prisma.hackathon.update({
    where: { id },
    data: { status: 'COMPLETED' },
  })
}

const getLeaderboard = async (id) => {
  const hackathon = await prisma.hackathon.findUnique({ where: { id } })
  if (!hackathon) throw new AppError('Hackathon not found', 404)
  if (hackathon.status !== 'COMPLETED') throw new AppError('Results not yet announced', 403)

  const submissions = await prisma.submission.findMany({
    where: { hackathonId: id },
    include: {
      user: { select: { id: true, name: true } },
      evaluations: {
        select: { innovationScore: true, impactScore: true, technicalScore: true },
      },
    },
  })

  const ranked = submissions
    .map((s) => {
      const evalCount = s.evaluations.length
      const avgScore = evalCount === 0
        ? 0
        : s.evaluations.reduce(
            (sum, e) => sum + (e.innovationScore + e.impactScore + e.technicalScore) / 3,
            0
          ) / evalCount

      return {
        id: s.id,
        title: s.title,
        projectLink: s.projectLink,
        submittedBy: s.user,
        averageScore: parseFloat(avgScore.toFixed(2)),
        evaluationCount: evalCount,
        submittedAt: s.createdAt,
      }
    })
    .sort((a, b) => b.averageScore - a.averageScore || a.submittedAt - b.submittedAt)

  return ranked
}

// Called by scheduler to auto-transition statuses
const runStatusTransitions = async () => {
  const now = new Date()

  await prisma.hackathon.updateMany({
    where: { status: 'PENDING', startTime: { lte: now } },
    data: { status: 'ACTIVE' },
  })

  await prisma.hackathon.updateMany({
    where: { status: 'ACTIVE', submissionDeadline: { lte: now } },
    data: { status: 'SUBMISSION_CLOSED' },
  })
}

const getFeatured = async () => {
  const active = await prisma.hackathon.findFirst({
    where: { status: 'ACTIVE' },
    orderBy: { startTime: 'asc' },
    include: { _count: { select: { submissions: true } } },
  })
  if (active) return active

  return prisma.hackathon.findFirst({
    where: { status: 'PENDING' },
    orderBy: { startTime: 'asc' },
    include: { _count: { select: { submissions: true } } },
  })
}

const getCurrent = async () => {
  const hackathon = await prisma.hackathon.findFirst({
    orderBy: { createdAt: 'desc' },
    include: {
      createdBy: { select: { id: true, name: true } },
      _count: { select: { submissions: true } },
    },
  })
  if (!hackathon) throw new AppError('No hackathon found', 404)
  return hackathon
}

module.exports = { createHackathon, listHackathons, getHackathon, announceResults, getLeaderboard, runStatusTransitions, getFeatured, getCurrent }
