const router = require("express").Router();
const postsController = require("../controllers/postsController");

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
router.get("/:postId/comments", postsController.getAllCommentsOfPost);

// Create new comment for one post
router.post("/:postId/comments", postsController.createNewComment);

// Get one comment
router.get("/:postId/comments/:commentId", postsController.getOneComment);

// Delete one comment (PROTECTED)
router.delete("/:postId/comments/:commentId", postsController.deleteOneComment);

// Get one comment likes count
router.get(
	"/:postId/comments/:commentId/likes",
	postsController.getLikesOfComment
);

// Update one comment likes count
router.put(
	"/:postId/comments/:commentId/likes",
	postsController.updateLikesOfComment
);

module.exports = router;
