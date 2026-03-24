const router = require('express').Router()
const { body } = require('express-validator')
const controller = require('../controllers/auth.controller')
const validate = require('../middleware/validate')

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  ],
  validate,
  controller.register
)

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  validate,
  controller.login
)

router.post('/refresh', controller.refresh)
router.post('/logout', controller.logout)

module.exports = router
