require("dotenv").config();
const AdminModel = require("../models/AdminModel");
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");

function validateErrorsHandler(req, res, next) {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.mapped() });
	}

	next();
}

exports.signupPost = [
	check("fullName", "This field is require")
		.trim()
		.escape()
		.isLength({ min: 1 }),
	check("username", "Username need to be atleast 4 characters long")
		.trim()
		.escape()
		.isLength({ min: 4 }),
	check("password", "Password need to be atleast 4 characters long")
		.trim()
		.escape()
		.isLength({ min: 4 }),
	validateErrorsHandler,
	async (req, res, next) => {
		try {
			const { fullName, username, password, signupKey } = req.body;

			if (signupKey != process.env.SIGNUP_SECRET || !signupKey) {
				return res
					.status(400)
					.json({ errors: "Your sign up key is missing or incorrect" });
			}

			const u = await AdminModel.findOne({ username: username });
			if (u) {
				return res.status(400).json({ errors: "Username already exist" });
			}

			const hashedPassword = await bcrypt.hash(password, 10);
			const user = await AdminModel.create({
				fullName,
				username,
				password: hashedPassword,
			});

			user.save().then(res.status(200).json({ msg: "Signup success", user }));
		} catch (error) {
			return next(error);
		}
	},
];

exports.loginPost = [
	check("username", "Username need to be atleast 4 characters long")
		.trim()
		.escape()
		.isLength({ min: 4 }),
	check("password", "Password need to be atleast 4 characters long")
		.trim()
		.escape()
		.isLength({ min: 4 }),
	validateErrorsHandler,
	passport.authenticate("local", { session: false }),
	(req, res, next) => {
		const { user } = req;
		const token = jwt.sign({ sub: user._id }, process.env.TOKEN_SECRET);

		res.status(200).json({ user, token });
	},
];
