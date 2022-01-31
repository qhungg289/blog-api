const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
	fullName: { type: String, required: true },
	username: { type: String, required: true },
	password: { type: String, required: true },
	blogPosts: [{ type: mongoose.Types.ObjectId, ref: "BlogPost" }],
});

module.exports = mongoose.model("Admin", adminSchema);
