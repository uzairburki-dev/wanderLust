const Listing = require('../models/listingModel');
const axios = require('axios');

//function for geocoding
getGeo =async (location) =>{
    const geocodingUrl = `https://nominatim.openstreetmap.org/search?q=${location}&format=json&limit=1`;
    try {
        const response = await axios.get(geocodingUrl, {
            headers: {
                'User-Agent': 'MyApp/1.0 (uzairahmad41@gmail.com)', // required by OSM
                'Accept-Language': 'en'
            }
        });
        return response.data[0];
    } catch (err) {
        console.error("Error fetching geocoding:", err.response?.status, err.response?.statusText);
    }
};

module.exports.index = async (req, res) => {
    const allListings = await Listing.find();
    res.render("listings/index.ejs", { allListings });
};

module.exports.new = (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.create = async (req, res, next) => {
    let Url = req.file.path;
    let fileName = req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { Url, fileName };
    const location = newListing.location;
    const coordinates = await getGeo(location);
    newListing.coordinates[0] = coordinates.lat;
    newListing.coordinates[1] = coordinates.lon;
    await newListing.save();
    req.flash("success", "Success! Your listing is now live.");
    res.redirect('/listings');
};

module.exports.show = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate({ path: "reviews", populate: { path: "created_by" }, }).populate("owner");
    if (!listing) {
        req.flash("error", "Sorry, this listing is no longer available.");
        res.redirect("/listings");
    } else {
        res.render('listings/show.ejs', { listing });
    }
};

module.exports.edit = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    let originalUrl = listing.image.Url;
    originalUrl = originalUrl.replace("/upload", "/upload/w_300");
    if (!listing) {
        req.flash("error", "Edit failed — listing not found.");
        res.redirect('/listings');
    } else {
        res.render('listings/edit.ejs', { listing, originalUrl });
    }
};
module.exports.update = async (req, res) => {
    let { id } = req.params;
    let updateData = { ...req.body.listing };
    if (updateData.location) {
        const getGeoData = await getGeo(updateData.location);
        updateData.coordinates = [getGeoData.lat, getGeoData.lon];
    }
    if (req.file) {
        updateData.image = {
            Url: req.file.path,
            fileName: req.file.filename
        };
    }
    const updatedListing = await Listing.findByIdAndUpdate(id, updateData, {
        new: true, // returns updated document
        runValidators: true
    });
    req.flash("success", "listing updated");
    res.redirect(`/listings/${id}`);
};

module.exports.destroy = async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Removed Successfully");
    res.redirect('/listings');
};

module.exports.filters = async (req, res) => {
    let filter = req.query.type;
    const allListings = await Listing.find({ Category: filter });
    if(!allListings.length){
        req.flash("error", "No relvent serch found");
        return res.redirect("/listings");
    }
    res.render("listings/index.ejs", { allListings });
}

module.exports.getGeo;