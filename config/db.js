require("dotenv").config();
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI);
mongoose.connection.on("error", (error) => console.error(error));
