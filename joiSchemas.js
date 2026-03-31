const Joi = require("joi");

module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        image: Joi.object({
            fileName: Joi.string(),
            Url: Joi.string().allow("", null),
        }),
        price: Joi.number().required(),
        country: Joi.string().required().min(0),
        location: Joi.string().required(),
        Category: Joi.string().allow("Tranding", "Rooms", "Iconic Cities", "Mountains", "Castles", "Amazing Pools", "Capming", "Farms", "Arctic", "Domes", "Boats").required(),
    }).required(),
});


module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        comment: Joi.string().required(),
    }).required(),
});