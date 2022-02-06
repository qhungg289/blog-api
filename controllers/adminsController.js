require("dotenv").config();
const AdminModel = require("../models/AdminModel");
const { check } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const validateErrorsHandler = require("../error_handlers/validateErrorsHandler");

exports.signUp = [
	// Validate the incoming json
	check("fullName", "This field is required")
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
			// Extract all the properties from req.body
			const { fullName, username, password, signUpKey } = req.body;

			// Check if sign up key is correct to proceed
			if (signUpKey != process.env.SIGNUP_SECRET || !signUpKey) {
				return res
					.status(400)
					.json({ errors: "Your sign up key is missing or incorrect" });
			}

			// Check if username already exist or not
			const u = await AdminModel.findOne({ username: username });
			if (u) {
				return res.status(400).json({ errors: "Username already exist" });
			}

			// Password hashing
			const hashedPassword = await bcrypt.hash(password, 10);

			// Create new user using the hashed password
			const user = await AdminModel.create({
				fullName,
				username,
				password: hashedPassword,
			});

			// Save user document then respond back to the client
			await user
				.save()
				.then(res.status(200).json({ msg: "Signup success", user }));
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
	(req, res, next) => {
		// Extract user property from req object
		const { user } = req;

		// Sign a new token from user._id with a secret key with expriation of 2 days
		const token = jwt.sign({ sub: user._id }, process.env.TOKEN_SECRET, {
			expiresIn: "2 days",
		});

		// Respond the token back to the user
		res.status(200).json({ user, token });
	},
];
