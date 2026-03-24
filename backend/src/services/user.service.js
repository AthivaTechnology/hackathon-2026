const prisma = require('../config/prisma')
const AppError = require('../utils/AppError')
const { hashPassword } = require('../utils/password')

const listUsers = async () => {
  return prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  })
}

const updateUser = async (id, { name, role }) => {
  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) throw new AppError('User not found', 404)

  return prisma.user.update({
    where: { id },
    data: { ...(name && { name }), ...(role && { role }) },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  })
}

const deleteUser = async (id, requestingUserId) => {
  if (id === requestingUserId) throw new AppError('Cannot delete your own account', 400)

  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) throw new AppError('User not found', 404)

  const hasSubmissions = await prisma.submission.count({ where: { userId: id } })
  const hasEvaluations = await prisma.evaluation.count({ where: { judgeId: id } })

  if (hasSubmissions > 0 || hasEvaluations > 0) {
    throw new AppError('Cannot delete user with existing submissions or evaluations', 409)
  }

  await prisma.user.delete({ where: { id } })
}

const resetPassword = async (id, newPassword) => {
  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) throw new AppError('User not found', 404)

  const passwordHash = await hashPassword(newPassword)
  await prisma.user.update({ where: { id }, data: { passwordHash } })
  await prisma.refreshToken.deleteMany({ where: { userId: id } })
}

module.exports = { listUsers, updateUser, deleteUser, resetPassword }
