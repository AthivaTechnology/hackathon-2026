const router = require('express').Router()
const { body } = require('express-validator')
const controller = require('../controllers/user.controller')
const { verifyToken, requireRole } = require('../middleware/auth')
const validate = require('../middleware/validate')

router.use(verifyToken, requireRole('ADMIN'))

router.get('/', controller.listUsers)

router.patch(
  '/:id',
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('role').optional().isIn(['ADMIN', 'JUDGE', 'PARTICIPANT']).withMessage('Invalid role'),
  ],
  validate,
  controller.updateUser
)

router.delete('/:id', controller.deleteUser)

module.exports = router
