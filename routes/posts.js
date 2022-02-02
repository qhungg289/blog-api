const router = require("express").Router();

// Get lists of all posts
router.get("/");

// Create new posts (PROTECTED)
router.post("/");

// Get one post
router.get("/:postId");

// Update one post (PROTECTED)
router.put("/:postId");

// Delete one post (PROTECTED)
router.delete("/:postId");

// Get likes count on one post
router.get("/:postId/likes");

// Update likes count on one post
router.put("/:postId/likes");

// Get all comments of one post
router.get("/posts/:postId/comments");

// Create new comment for one post
router.post("/posts/:postId/comments");

// Delete one comment (PROTECTED)
router.delete("/posts/:postId/comments/:commentId");

// Get one comment likes count
router.get("/posts/:postId/comments/:commentId/likes");

// Update one comment likes count
router.put("/posts/:postId/comments/:commentId/likes");

module.exports = router;
