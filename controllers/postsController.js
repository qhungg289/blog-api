const AdminModel = require("../models/AdminModel");
const BlogPostModel = require("../models/BlogPostModel");
const CommentModel = require("../models/CommentModel");
const passport = require("passport");
const { check } = require("express-validator");
const validateErrorsHandler = require("../error_handlers/validateErrorsHandler");

exports.getAllPosts = async (req, res, next) => {
	try {
		// Get the list of all posts and populate "comments" field
		const posts = await BlogPostModel.find({}).populate("comments");

		// Respond posts list to the client
		res.status(200).json({ posts });
	} catch (error) {
		return next(error);
	}
};

exports.createNewPost = [
	// Authenticate with JWT with session disabled
	passport.authenticate("jwt", { session: false }),
	// Validate the incoming json
	check("title", "Title can't be empty").trim().escape().isLength({ min: 1 }),
	check("content", "Content can't be empty")
		.trim()
		.escape()
		.isLength({ min: 1 }),
	check("publishStatus").isBoolean(),
	validateErrorsHandler,
	async (req, res, next) => {
		try {
			// Extract all the properties from req.body
			const { title, content, publishStatus } = req.body;

			// Waiting for 2 promises to resolve and return post and user
			const [post, user] = await Promise.all([
				BlogPostModel.create({
					title,
					content,
					publishStatus,
				}),
				AdminModel.findById(req.user._id).exec(),
			]);

			// Append new created post to the end of the blogPosts array
			user.blogPosts = [...user.blogPosts, post];

			// Save user and post documents to the database then send a respond with
			// the messeage and the post object
			await Promise.all([post.save(), user.save()]).then(
				res.status(200).json({ msg: "Success", post })
			);
		} catch (error) {
			return next(error);
		}
	},
];

exports.getOnePost = async (req, res, next) => {
	try {
		// Find one post with the postId params and populate "comments" field
		const post = await BlogPostModel.findById(req.params.postId).populate(
			"comments"
		);

		// Respond with post
		res.status(200).json({ post });
	} catch (error) {
		return next(error);
	}
};

exports.updateOnePost = [
	// Authenticate with JWT with session disabled
	passport.authenticate("jwt", { session: false }),
	// Validate the incoming json
	check("title", "Title can't be empty").trim().escape().isLength({ min: 1 }),
	check("content", "Content can't be empty")
		.trim()
		.escape()
		.isLength({ min: 1 }),
	check("publishStatus").isBoolean(),
	validateErrorsHandler,
	async (req, res, next) => {
		try {
			const { title, content, publishStatus } = req.body;

			// Use postId params to find and update,
			// with new: true to return a modified document
			const post = await BlogPostModel.findByIdAndUpdate(
				req.params.postId,
				{ title, content, publishStatus },
				{ new: true }
			);

			res.status(200).json({ post });
		} catch (error) {
			return next(error);
		}
	},
];

exports.deleteOnePost = [
	// Authenticate with JWT with session disabled
	passport.authenticate("jwt", { session: false }),
	async (req, res, next) => {
		try {
			const [post, user] = await Promise.all([
				BlogPostModel.findByIdAndDelete(req.params.postId).exec(),
				AdminModel.findById(req.user._id).exec(),
			]);

			// Find index of the post and remove the post from blogPosts array
			const index = user.blogPosts.indexOf(post._id);
			if (index > -1) {
				user.blogPosts.splice(index, 1);
			}

			await user.save().then(res.status(200).json({ post }));
		} catch (error) {
			return next(error);
		}
	},
];

exports.getLikesOfPost = async (req, res, next) => {
	try {
		// Only get the likesCount field
		const likes = await BlogPostModel.findById(req.params.postId, "likesCount");

		res.status(200).json({ likes });
	} catch (error) {
		return next(error);
	}
};

exports.updateLikesOfPost = [
	// Check if likes is a number or not
	check("likes", "Likes count need to be a number").isNumeric(),
	validateErrorsHandler,
	async (req, res, next) => {
		try {
			// Use postId params to find and update the likesCount field to req.body.likes
			const post = await BlogPostModel.findByIdAndUpdate(
				req.params.postId,
				{
					likesCount: req.body.likes,
				},
				{ new: true }
			);

			res.status(200).json({ post });
		} catch (error) {
			return next(error);
		}
	},
];

exports.getAllCommentsOfPost = async (req, res, next) => {
	try {
		// Find all comments belong to one post
		const comments = await CommentModel.find({
			belongToPost: req.params.postId,
		});

		res.status(200).json({ comments });
	} catch (error) {
		return next(error);
	}
};

exports.createNewComment = [
	check("author").trim().escape(),
	check("content").trim().escape().isLength({ min: 1 }),
	validateErrorsHandler,
	async (req, res, next) => {
		try {
			const { author, content } = req.body;

			const [comment, post] = await Promise.all([
				// Create new comment
				// If author is an empty string or undefined
				// Return "Anonymous"
				CommentModel.create({
					author: author == "" || author == undefined ? "Anonymous" : author,
					content,
					belongToPost: req.params.postId,
				}),
				BlogPostModel.findById(req.params.postId).exec(),
			]);

			// Append new comment to the comments array
			post.comments = [...post.comments, comment];

			await Promise.all([comment.save(), post.save()]).then(
				res.status(200).json({ comment, post })
			);
		} catch (error) {
			return next(error);
		}
	},
];

exports.getOneComment = async (req, res, next) => {
	try {
		// Get one comment using commentId params
		const comment = await CommentModel.findById(req.params.commentId).populate(
			"belongToPost"
		);

		res.status(200).json({ comment });
	} catch (error) {
		return next(error);
	}
};

exports.deleteOneComment = [
	// Authenticate using JWT with session disabled
	passport.authenticate("jwt", { session: false }),
	async (req, res, next) => {
		try {
			const [comment, post] = await Promise.all([
				CommentModel.findByIdAndDelete(req.params.commentId).exec(),
				BlogPostModel.findById(req.params.postId).exec(),
			]);

			// Find index of a comment and delete from comments array
			const index = post.comments.indexOf(comment._id);
			if (index > -1) {
				post.comments.splice(index, 1);
			}

			await post.save().then(res.status(200).json({ comment }));
		} catch (error) {
			return next(error);
		}
	},
];

exports.getLikesOfComment = async (req, res, next) => {
	try {
		const likes = await CommentModel.findById(
			req.params.commentId,
			"likesCount"
		);

		res.status(200).json({ likes });
	} catch (error) {
		return next(error);
	}
};

exports.updateLikesOfComment = [
	// Check if likes is a number or not
	check("likes", "Likes count need to be a number").isNumeric(),
	validateErrorsHandler,
	async (req, res, next) => {
		try {
			// Use commentId params to find and update likesCount field
			const post = await CommentModel.findByIdAndUpdate(
				req.params.commentId,
				{ likesCount: req.body.likes },
				{ new: true }
			);

			res.status(200).json({ post });
		} catch (error) {
			return next(error);
		}
	},
];
