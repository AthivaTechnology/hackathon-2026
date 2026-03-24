const router = require('express').Router()
const { body } = require('express-validator')
const controller = require('../controllers/evaluation.controller')
const { verifyToken, requireRole } = require('../middleware/auth')
const validate = require('../middleware/validate')

const scoreValidation = [
  body('innovationScore').isInt({ min: 1, max: 10 }).withMessage('Innovation score must be 1-10'),
  body('impactScore').isInt({ min: 1, max: 10 }).withMessage('Impact score must be 1-10'),
  body('technicalScore').isInt({ min: 1, max: 10 }).withMessage('Technical score must be 1-10'),
  body('feedback').optional().isString(),
]

// POST /api/submissions/:submissionId/evaluations  (mounted via comment.routes under /api)
// PATCH /api/evaluations/:id

router.patch(
  '/:id',
  verifyToken,
  requireRole('JUDGE'),
  [
    body('innovationScore').optional().isInt({ min: 1, max: 10 }),
    body('impactScore').optional().isInt({ min: 1, max: 10 }),
    body('technicalScore').optional().isInt({ min: 1, max: 10 }),
    body('feedback').optional().isString(),
  ],
  validate,
  controller.updateEvaluation
)

module.exports = { router, scoreValidation }
