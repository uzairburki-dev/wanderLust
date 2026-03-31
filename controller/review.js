const Listing = require("../models/listingModel");
const Review = require("../models/reviewsModel");

module.exports.addReview = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    const newReview = new Review(req.body.review);
    listing.reviews.push(newReview);
    newReview.created_by = req.user._id;
    await newReview.save();
    await listing.save();
    req.flash("success", "review added");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyReview = async (req, res) => {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "review deleted");
    res.redirect(`/listings/${id}`);
};