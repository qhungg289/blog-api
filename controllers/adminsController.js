require("dotenv").config();
const AdminModel = require("../models/AdminModel");
const { check } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const validateErrorsHandler = require("../middlewares/validateErrorsHandler");

exports.signUp = [
	// Validate the incoming json
	check("fullName", "Full name is required")
		.trim()
		.escape()
		.isLength({ min: 1 }),
	check("username")
		.trim()
		.escape()
		.custom(async (value) => {
			if (value.length < 4) {
				throw new Error("User name to be atleast 4 characters long");
			}

			const user = await AdminModel.findOne({ username: value });
			if (user) {
				throw new Error("Username already exist");
			}

			return true;
		}),
	check("password", "Password need to be atleast 4 characters long")
		.trim()
		.escape()
		.isLength({ min: 4 }),
	validateErrorsHandler,
	async (req, res, next) => {
		try {
			// Extract all the properties from req.body
			const { fullName, username, password } = req.body;

			// Password hashing
			let hashedPassword = await bcrypt.hash(password, 10);

			// Create new user using the hashed password
			const user = await AdminModel.create({
				fullName,
				username,
				password: hashedPassword,
			});

			// Save user document then respond back to the client
			await user.save().then(() => {
				// Remove password field from the respone user object
				user = user.toObject();
				delete user.password;
				res.status(200).json({ message: "Signup success", user });
			});
		} catch (error) {
			return next(error);
		}
	},
];

exports.logIn = [
	// Validate the incoming json
	check("username", "Username need to be atleast 4 characters long")
		.trim()
		.escape()
		.isLength({ min: 4 }),
	check("password", "Password need to be atleast 4 characters long")
		.trim()
		.escape()
		.isLength({ min: 4 }),
	validateErrorsHandler,
	// Authenticate with local strategy
	passport.authenticate("local", { session: false }),
	(req, res) => {
		// Extract user property from req object
		let { user } = req;
		user = user.toObject();
		delete user.password;

		// Sign a new token from user._id with a secret key
		const token = jwt.sign(
			{ sub: user._id, fullName: user.fullName, username: user.username },
			process.env.TOKEN_SECRET
		);

		// Respond the token back to the user
		res.status(200).json({ user, token });
	},
];
