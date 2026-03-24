const commentService = require('../services/comment.service')

const createComment = async (req, res, next) => {
  try {
    const comment = await commentService.createComment(
      req.params.submissionId,
      req.user.userId,
      req.body.content
    )
    res.status(201).json({ comment })
  } catch (err) {
    next(err)
  }
}

const listComments = async (req, res, next) => {
  try {
    const comments = await commentService.listComments(req.params.submissionId)
    res.json({ comments })
  } catch (err) {
    next(err)
  }
}

module.exports = { createComment, listComments }
