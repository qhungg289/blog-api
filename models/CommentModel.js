const mongoose = require("mongoose");
const { DateTime } = require("luxon");

const commentSchema = new mongoose.Schema(
	{
		author: { type: String, default: "Anonymous" },
		belongToPost: { type: mongoose.Types.ObjectId, ref: "BlogPost" },
		content: { type: String, required: true },
		likesCount: { type: Number, default: 0, min: 0 },
	},
	{ timestamps: { currentTime: () => DateTime.now() } }
);

commentSchema.method("getTimeStampString", function () {
	return this.timestamps.toLocaleString(DateTime.DATETIME_MED);
});

module.exports = mongoose.model("Comment", commentSchema);
