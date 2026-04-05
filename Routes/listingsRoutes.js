//Imported Packages
const express = require("express");
const router = express.Router();
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

//Imported Files
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn, validateListing, isOwner } = require("../middlewares");
const listingControllers = require("../controller/listing");

//Index Route
router.route("/")
    .get(wrapAsync(listingControllers.index))
    .post(isLoggedIn, upload.single('listing[image]'), validateListing, wrapAsync(listingControllers.create));
   
//new Route
router.get('/new', isLoggedIn, listingControllers.new);
router.get("/filter", listingControllers.filters);
router.route("/:id")
    .get(wrapAsync(listingControllers.show))
    .put(isLoggedIn, isOwner, upload.single('listing[image]'), validateListing, wrapAsync(listingControllers.update))
    .delete(isLoggedIn, isOwner, wrapAsync(listingControllers.destroy));

//edit Route
router.get('/:id/edit', isLoggedIn, isOwner, wrapAsync(listingControllers.edit));
module.exports = router;
