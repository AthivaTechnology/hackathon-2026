const userService = require('../services/user.service')

const listUsers = async (req, res, next) => {
  try {
    const users = await userService.listUsers()
    res.json({ users })
  } catch (err) {
    next(err)
  }
}

const updateUser = async (req, res, next) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body)
    res.json({ user })
  } catch (err) {
    next(err)
  }
}

const deleteUser = async (req, res, next) => {
  try {
    await userService.deleteUser(req.params.id, req.user.userId)
    res.json({ message: 'User deleted' })
  } catch (err) {
    next(err)
  }
}

const resetPassword = async (req, res, next) => {
  try {
    await userService.resetPassword(req.params.id, req.body.newPassword)
    res.json({ message: 'Password reset successfully' })
  } catch (err) {
    next(err)
  }
}

module.exports = { listUsers, updateUser, deleteUser, resetPassword }
