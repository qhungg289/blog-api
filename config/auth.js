require("dotenv").config();
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const AdminModel = require("../models/AdminModel");
const bcrypt = require("bcryptjs");

passport.use(
	new LocalStrategy({ session: false }, async (username, password, done) => {
		try {
			const user = await AdminModel.findOne({ username: username });

			if (!user) {
				return done(null, false);
			}

			if (!(await bcrypt.compare(password, user.password))) {
				return done(null, false);
			}

			return done(null, user);
		} catch (error) {
			return done(error);
		}
	})
);

const jwtOptions = {
	jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
	secretOrKey: process.env.TOKEN_SECRET,
	session: false,
};

passport.use(
	new JwtStrategy(jwtOptions, async (jwt_payload, done) => {
		try {
			const user = await AdminModel.findById(jwt_payload.sub);

			return done(null, user);
		} catch (error) {
			return done(error);
		}
	})
);
