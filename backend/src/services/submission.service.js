const prisma = require('../config/prisma')
const AppError = require('../utils/AppError')

const assertEditable = (hackathon) => {
  if (hackathon.status === 'SUBMISSION_CLOSED' || hackathon.status === 'COMPLETED') {
    throw new AppError('Submission deadline has passed', 403)
  }
  if (new Date() >= hackathon.submissionDeadline) {
    throw new AppError('Submission deadline has passed', 403)
  }
}

const createSubmission = async (hackathonId, userId, data) => {
  const hackathon = await prisma.hackathon.findUnique({ where: { id: hackathonId } })
  if (!hackathon) throw new AppError('Hackathon not found', 404)
  if (hackathon.status === 'COMPLETED') throw new AppError('Hackathon is completed', 403)
  if (new Date() >= hackathon.submissionDeadline) throw new AppError('Submission deadline has passed', 403)

  const existing = await prisma.submission.findUnique({
    where: { hackathonId_userId: { hackathonId, userId } },
  })
  if (existing) throw new AppError('You already have a submission for this hackathon', 409)

  return prisma.submission.create({
    data: {
      hackathonId,
      userId,
      title: data.title,
      description: data.description,
      projectLink: data.projectLink || null,
    },
    include: { user: { select: { id: true, name: true } } },
  })
}

const listSubmissions = async (hackathonId, currentUserId) => {
  const hackathon = await prisma.hackathon.findUnique({ where: { id: hackathonId } })
  if (!hackathon) throw new AppError('Hackathon not found', 404)

  const submissions = await prisma.submission.findMany({
    where: { hackathonId },
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, name: true } },
      _count: { select: { comments: true, evaluations: true, likes: true } },
      likes: currentUserId ? { where: { userId: currentUserId }, select: { userId: true } } : false,
    },
  })

  return submissions.map(({ likes, _count, ...s }) => ({
    ...s,
    _count,
    likeCount: _count.likes,
    likedByMe: likes ? likes.length > 0 : false,
  }))
}

const getSubmission = async (id, requestingUser) => {
  const submission = await prisma.submission.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true } },
      hackathon: true,
      comments: {
        orderBy: { createdAt: 'asc' },
        include: { user: { select: { id: true, name: true } } },
      },
      evaluations: {
        include: { judge: { select: { id: true, name: true } } },
      },
      _count: { select: { likes: true } },
      likes: { where: { userId: requestingUser.userId }, select: { userId: true } },
    },
  })
  if (!submission) throw new AppError('Submission not found', 404)

  const isCompleted = submission.hackathon.status === 'COMPLETED'
  const isAdmin = requestingUser.role === 'ADMIN'

  const evaluations = submission.evaluations.map((e) => {
    const isJudgeOwner = e.judgeId === requestingUser.userId
    if (isCompleted || isAdmin || isJudgeOwner) return e
    return {
      id: e.id,
      submissionId: e.submissionId,
      judge: e.judge,
      innovationScore: null,
      impactScore: null,
      technicalScore: null,
      feedback: null,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
    }
  })

  const { likes, _count, ...rest } = submission
  return {
    ...rest,
    evaluations,
    likeCount: _count.likes,
    likedByMe: likes.length > 0,
  }
}

const updateSubmission = async (id, userId, data) => {
  const submission = await prisma.submission.findUnique({
    where: { id },
    include: { hackathon: true },
  })
  if (!submission) throw new AppError('Submission not found', 404)
  if (submission.userId !== userId) throw new AppError('Not authorized to edit this submission', 403)

  assertEditable(submission.hackathon)

  return prisma.submission.update({
    where: { id },
    data: {
      ...(data.title && { title: data.title }),
      ...(data.description && { description: data.description }),
      ...(data.projectLink !== undefined && { projectLink: data.projectLink || null }),
    },
    include: { user: { select: { id: true, name: true } } },
  })
}

const toggleLike = async (submissionId, userId) => {
  const existing = await prisma.like.findUnique({
    where: { submissionId_userId: { submissionId, userId } },
  })

  if (existing) {
    await prisma.like.delete({ where: { submissionId_userId: { submissionId, userId } } })
  } else {
    const submission = await prisma.submission.findUnique({ where: { id: submissionId } })
    if (!submission) throw new AppError('Submission not found', 404)
    await prisma.like.create({ data: { submissionId, userId } })
  }

  const likeCount = await prisma.like.count({ where: { submissionId } })
  return { likedByMe: !existing, likeCount }
}

module.exports = { createSubmission, listSubmissions, getSubmission, updateSubmission, toggleLike }
