require("dotenv").config();
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const AdminModel = require("../models/AdminModel");
const bcrypt = require("bcryptjs");

// -------------------------
// Set up local strategy
// -------------------------
passport.use(
	// Create an instance of LocalStrategy class, with session disabled
	new LocalStrategy({ session: false }, async (username, password, done) => {
		try {
			// Find one user from the username
			const user = await AdminModel.findOne({ username: username });

			// If there is no user, return with no error and no user (false)
			if (!user) {
				return done(null, false);
			}

			// Compare the password with the one in the database,
			// if not match return with no error and no user (false)
			if (!(await bcrypt.compare(password, user.password))) {
				return done(null, false);
			}

			// Return the user with no error
			return done(null, user);
		} catch (error) {
			return done(error);
		}
	})
);

// -------------------------
// Set up JWT strategy
// -------------------------

// Options for the strategy
const jwtOptions = {
	jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
	secretOrKey: process.env.TOKEN_SECRET,
	session: false,
};

passport.use(
	// Create an instace of JwtStrategy
	new JwtStrategy(jwtOptions, async (jwt_payload, done) => {
		try {
			// Find a user with the jwt_payload.sub (user._id)
			const user = await AdminModel.findById(jwt_payload.sub);

			return done(null, user);
		} catch (error) {
			return done(error);
		}
	})
);
