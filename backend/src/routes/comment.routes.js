const router = require('express').Router()
const { body } = require('express-validator')
const commentController = require('../controllers/comment.controller')
const evaluationController = require('../controllers/evaluation.controller')
const { scoreValidation } = require('./evaluation.routes')
const { verifyToken, requireRole } = require('../middleware/auth')
const validate = require('../middleware/validate')

// Comments
router.get('/submissions/:submissionId/comments', verifyToken, commentController.listComments)
router.post(
  '/submissions/:submissionId/comments',
  verifyToken,
  [body('content').trim().notEmpty().withMessage('Comment content is required')],
  validate,
  commentController.createComment
)

// Evaluations (nested under submissions)
router.post(
  '/submissions/:submissionId/evaluations',
  verifyToken,
  requireRole('JUDGE'),
  scoreValidation,
  validate,
  evaluationController.createEvaluation
)

module.exports = router
