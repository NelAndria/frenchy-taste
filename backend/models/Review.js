import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    recipe: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
    createdAt: { type: Date, default: Date.now },
    usefulCount: { type: Number, default: 0 }
});

const Review = mongoose.model("Review", reviewSchema);

export default Review;