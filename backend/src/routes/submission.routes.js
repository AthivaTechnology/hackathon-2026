const router = require('express').Router()
const { body } = require('express-validator')
const controller = require('../controllers/submission.controller')
const { verifyToken, requireRole } = require('../middleware/auth')
const validate = require('../middleware/validate')

router.get('/:id', verifyToken, controller.getSubmission)

router.patch(
  '/:id',
  verifyToken,
  requireRole('PARTICIPANT'),
  [
    body('title').optional().trim().notEmpty(),
    body('description').optional().trim().notEmpty(),
    body('demoLink').optional({ checkFalsy: true }).isURL().withMessage('Must be a valid URL'),
  ],
  validate,
  controller.updateSubmission
)

module.exports = router
