const router = require('express').Router()
const { body } = require('express-validator')
const controller = require('../controllers/auth.controller')
const validate = require('../middleware/validate')
const { verifyToken } = require('../middleware/auth')

router.post(
  '/send-otp',
  [body('email').isEmail().normalizeEmail().withMessage('Valid email required')],
  validate,
  controller.sendOtp
)

router.post(
  '/verify-otp',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('code').isLength({ min: 6, max: 6 }).isNumeric().withMessage('Code must be 6 digits'),
  ],
  validate,
  controller.verifyOtp
)

router.patch(
  '/profile',
  verifyToken,
  [body('name').trim().notEmpty().withMessage('Name is required')],
  validate,
  controller.updateProfile
)

router.post('/refresh', controller.refresh)
router.post('/logout', controller.logout)

module.exports = router
