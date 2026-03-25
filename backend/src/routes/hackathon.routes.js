const router = require('express').Router()
const { body } = require('express-validator')
const controller = require('../controllers/hackathon.controller')
const submissionController = require('../controllers/submission.controller')
const { verifyToken, requireRole } = require('../middleware/auth')
const validate = require('../middleware/validate')

router.get('/featured', controller.getFeatured)
router.get('/current', verifyToken, controller.getCurrent)
router.get('/', verifyToken, controller.listHackathons)
router.get('/:id', verifyToken, controller.getHackathon)
router.get('/:id/leaderboard', verifyToken, controller.getLeaderboard)

router.post(
  '/',
  verifyToken,
  requireRole('ADMIN'),
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('startTime').isISO8601().withMessage('Valid start time required'),
    body('submissionDeadline').isISO8601().withMessage('Valid submission deadline required'),
  ],
  validate,
  controller.createHackathon
)

router.post('/:id/announce', verifyToken, requireRole('ADMIN'), controller.announceResults)

// Nested: submissions under a hackathon
router.get('/:hackathonId/submissions', verifyToken, submissionController.listSubmissions)
router.post(
  '/:hackathonId/submissions',
  verifyToken,
  requireRole('PARTICIPANT'),
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('projectLink').optional({ checkFalsy: true }).isURL().withMessage('Must be a valid URL'),
    body('demoLink').optional({ checkFalsy: true }).isURL().withMessage('Must be a valid URL'),
  ],
  validate,
  submissionController.createSubmission
)

module.exports = router
