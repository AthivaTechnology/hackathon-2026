const prisma = require('../config/prisma')
const AppError = require('../utils/AppError')

const createComment = async (submissionId, userId, content) => {
  const submission = await prisma.submission.findUnique({ where: { id: submissionId } })
  if (!submission) throw new AppError('Submission not found', 404)

  return prisma.comment.create({
    data: { submissionId, userId, content },
    include: { user: { select: { id: true, name: true } } },
  })
}

const listComments = async (submissionId) => {
  const submission = await prisma.submission.findUnique({ where: { id: submissionId } })
  if (!submission) throw new AppError('Submission not found', 404)

  return prisma.comment.findMany({
    where: { submissionId },
    orderBy: { createdAt: 'asc' },
    include: { user: { select: { id: true, name: true } } },
  })
}

module.exports = { createComment, listComments }
