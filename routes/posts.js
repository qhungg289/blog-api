const router = require("express").Router();
const postsController = require("../controllers/postsController");
const commentsController = require("../controllers/commentsController");

// Get lists of all posts
router.get("/", postsController.getAllPosts);

// Create new posts (PROTECTED)
router.post("/", postsController.createNewPost);

// Get one post
router.get("/:postId", postsController.getOnePost);

// Update one post (PROTECTED)
router.put("/:postId", postsController.updateOnePost);

// Delete one post (PROTECTED)
router.delete("/:postId", postsController.deleteOnePost);

// Get likes count on one post
router.get("/:postId/likes", postsController.getLikesOfPost);

// Update likes count on one post
router.put("/:postId/likes", postsController.updateLikesOfPost);

// Get all comments of one post
router.get("/:postId/comments", commentsController.getAllCommentsOfPost);

// Create new comment for one post
router.post("/:postId/comments", commentsController.createNewComment);

// Get one comment
router.get("/:postId/comments/:commentId", commentsController.getOneComment);

// Delete one comment (PROTECTED)
router.delete(
	"/:postId/comments/:commentId",
	commentsController.deleteOneComment
);

// Get one comment likes count
router.get(
	"/:postId/comments/:commentId/likes",
	commentsController.getLikesOfComment
);

// Update one comment likes count
router.put(
	"/:postId/comments/:commentId/likes",
	commentsController.updateLikesOfComment
);

module.exports = router;
