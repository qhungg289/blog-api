const BlogPostModel = require("../models/BlogPostModel");
const CommentModel = require("../models/CommentModel");
const passport = require("passport");
const { check } = require("express-validator");
const validateErrorsHandler = require("../error_handlers/validateErrorsHandler");

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
