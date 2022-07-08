const AdminModel = require("../models/AdminModel");
const BlogPostModel = require("../models/BlogPostModel");
const passport = require("passport");
const { check } = require("express-validator");
const validateErrorsHandler = require("../middlewares/validateErrorsHandler");

exports.getAllPosts = async (req, res, next) => {
	try {
		// Get the post status to filter
		const status = req.query.status;
		let filter;

		// Determined which filter to use for the documents query
		if (status == "all" || status == undefined) {
			filter = {};
		} else if (status == "unpublish") {
			filter = { publishStatus: false };
		} else if (status == "publish") {
			filter = { publishStatus: true };
		} else {
			return res.status(400).json({ message: "Invalid publish status values" });
		}

		// Parse 2 query strings to a number
		const page = parseInt(req.query.page);
		const limit = parseInt(req.query.limit);

		// Guard the request to prevent abuse
		if (page < 1 || limit > 50) {
			return res.status(400).json({ message: "Invalid page or limit values" });
		}

		// Start value will use for the skip query
		const start = (page - 1) * limit;
		const end = page * limit;

		const paginate = {};

		// Get the total numbers of pages based on
		// the numbers of documents and the limit
		paginate.pagesCount = Math.ceil(
			(await BlogPostModel.countDocuments(filter)) / limit
		);

		// Check if the "end" value is smaller than the numbers
		// of documents
		if (end < (await BlogPostModel.countDocuments(filter))) {
			paginate.next = {
				page: page + 1,
				limit,
			};
		}

		// Check if the "start" value is bigger than 0
		if (start > 0) {
			paginate.previous = {
				page: page - 1,
				limit,
			};
		}

		// Get the list of all posts and populate "comments" field
		const posts = await BlogPostModel.find(filter)
			.limit(limit) // Limit the documents
			.skip(start) // Skip a "start" amounts of documents
			.populate("comments")
			.populate({ path: "belongToAuthor", select: "-password" });

		// Respond posts list to the client
		res.status(200).json({ paginate, posts });
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
					belongToAuthor: req.user,
				}),
				AdminModel.findById(req.user._id).exec(),
			]);

			// Append new created post to the end of the blogPosts array
			user.blogPosts = [...user.blogPosts, post];

			// Save user and post documents to the database then send a respond with
			// the messeage and the post object
			await Promise.all([post.save(), user.save()]).then(
				res.status(200).json({ message: "Success", post })
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
