require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const passport = require("passport");

const app = express();

require("./config/db");
require("./config/auth");

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(passport.initialize());

app.get("/", (req, res, next) => {
	res.json({ msg: "Hello World" });
});

const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`Server started on port: ${port}`));
