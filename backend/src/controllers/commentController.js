const CommentService = require('../services/commentService');
const catchAsync = require('../utils/catchAsync');

exports.addComment = catchAsync(async (req, res) => {
  const comment = await CommentService.addComment(
    Number(req.params.id),
    req.body.commentText,
    req.user
  );

  res.status(201).json({
    success: true,
    message: 'Comment added successfully.',
    data: comment
  });
});

exports.getCommentsByTask = catchAsync(async (req, res) => {
  const comments = await CommentService.getCommentsByTaskId(Number(req.params.id));

  res.status(200).json({
    success: true,
    count: comments.length,
    data: comments
  });
});