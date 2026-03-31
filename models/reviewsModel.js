const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    comment: {
        type: String,
    },
    rating: {
        type: Number,
        max: 5,
        min: 1,
    },
    created_at: {
        type: Date,
        default: Date.now(),
    },
    created_by: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
});

module.exports = mongoose.model("Review", reviewSchema);

