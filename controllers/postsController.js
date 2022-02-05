const AdminModel = require("../models/AdminModel");
const BlogPostModel = require("../models/BlogPostModel");
const CommentModel = require("../models/CommentModel");
const passport = require("passport");
const { check } = require("express-validator");
const validateErrorsHandler = require("../error_handlers/validateErrorsHandler");

exports.getAllPosts = async (req, res, next) => {
	try {
		const posts = await BlogPostModel.find({}).populate("comments");

		res.status(200).json({ posts });
	} catch (error) {
		return next(error);
	}
};

exports.createNewPost = [
	passport.authenticate("jwt", { session: false }),
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

			const post = await BlogPostModel.create({
				title,
				content,
				publishStatus,
			});
			const user = await AdminModel.findById(req.user._id);
			user.blogPosts = [...user.blogPosts, post];

			await post
				.save()
				.then(user.save())
				.then(res.status(200).json({ msg: "Success", post }));
		} catch (error) {
			return next(error);
		}
	},
];

exports.getOnePost = async (req, res, next) => {
	try {
		const post = await BlogPostModel.findById(req.params.postId).populate(
			"comments"
		);

		res.status(200).json({ post });
	} catch (error) {
		return next(error);
	}
};

exports.updateOnePost = [
	passport.authenticate("jwt", { session: false }),
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
	passport.authenticate("jwt", { session: false }),
	async (req, res, next) => {
		try {
			const post = await BlogPostModel.findByIdAndDelete(req.params.postId);

			res.status(200).json({ post });
		} catch (error) {
			return next(error);
		}
	},
];

exports.getLikesOfPost = async (req, res, next) => {
	try {
		const likes = await BlogPostModel.findById(req.params.postId, "likesCount");

		res.status(200).json({ likes });
	} catch (error) {
		return next(error);
	}
};

exports.updateLikesOfPost = [
	check("likes", "Likes count need to be a number").isNumeric(),
	validateErrorsHandler,
	async (req, res, next) => {
		try {
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
