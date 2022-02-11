const mongoose = require("mongoose");
const { DateTime } = require("luxon");

const blogPostSchema = new mongoose.Schema(
	{
		title: { type: String, required: true },
		content: { type: String, required: true },
		likesCount: { type: Number, default: 0, min: 0 },
		comments: [{ type: mongoose.Types.ObjectId, ref: "Comment" }],
		publishStatus: { type: Boolean, required: true },
	},
	{ timestamps: { currentTime: () => DateTime.now() } }
);

blogPostSchema.method("getTimeStampString", function () {
	return this.timestamps.toLocaleString(DateTime.DATETIME_MED);
});

module.exports = mongoose.model("BlogPost", blogPostSchema);
