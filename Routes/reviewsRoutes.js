//Imported Packages
const express = require("express");
const router = express.Router({mergeParams: true});

//Imported Files
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn, validateReview , isReviewOwner} = require("../middlewares");
const reviewController = require("../controller/review");

//Add Review
router.post("/", isLoggedIn, validateReview, wrapAsync(reviewController.addReview));

//delete review
router.delete("/:reviewId", isLoggedIn, isReviewOwner, wrapAsync(reviewController.destroyReview));

module.exports = router;