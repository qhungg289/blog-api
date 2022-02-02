require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const passport = require("passport");

// Initialize express
const app = express();

// Require database and authentication config
require("./config/db");
require("./config/auth");

// Apply all necessary middlewares
app.use(cors()); // Enable Cross Origin Resource Sharing
app.use(morgan("dev")); // Developement logging
app.use(express.json()); // Accept incomming json data
app.use(express.urlencoded({ extended: false }));
app.use(passport.initialize()); // Initialize passport js

const adminsRouter = require("./routes/admins");
const postsRouter = require("./routes/posts");

app.use("/admins", adminsRouter);
app.use("/posts", postsRouter);

// Get the port number and listen for incoming request
const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`Server started on port: ${port}`));
