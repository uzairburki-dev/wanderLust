const mongoose = require('mongoose');
const Review = require('./reviewsModel');
const schema = mongoose.Schema;

const listingSchema = new schema({
    title: {
        type: String,
    },
    description: {
        type: String,
    },
    image: {
        fileName: {
            type: String,
            default: "listing_image",
        },
        Url: {
            type: String,
            default: "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?auto=format&fit=crop&w=800&q=60",
            set: (v) => v === "" ? "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?auto=format&fit=crop&w=800&q=60" : v,
        }
    },
    price: {
        type: Number,
    },
    location: {
        type: String,
    },
    country: {
        type: String,
    },
    reviews: [
        {
            type: schema.Types.ObjectId,
            ref: "Review",
        },
    ],
    owner: {
        type: schema.Types.ObjectId,
        ref: "User",
    },
    coordinates: {
        type: [Number],
    },
    Category: {
        type: String,
        enum: ["Tranding", "Rooms", "Iconic Cities", "Mountains", "Castles", "Amazing Pools", "Camping", "Farms", "Arctic", "Domes", "Boats"],
        required: true,
    },
});


listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing) {
        await Review.deleteMany({ _id: { $in: listing.reviews } });
    }
    else {
        next();
    }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
