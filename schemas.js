const baseJoi = require('joi');
const sanitizeHtml = require('sanitize-html')

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHtml': '{{#label}} must not include HTML !'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedAttributes: {},
                    allowedTags: []
                })
                if (clean !== value) return helpers.error('string.escapeHtml', { value })
                return clean;
            }
        }
    }
})

const joi = baseJoi.extend(extension)

module.exports.campSchema = joi.object({
    campground: joi.object({
        title: joi.string().min(3).required().escapeHTML(),
        price: joi.number().required().min(0),
        location: joi.string().required().escapeHTML(),
        description: joi.string().min(10).required().escapeHTML()
    }).required(),
    img: joi.array().items(joi.object({
        url: joi.string().required(),
        filename: joi.string().required()
    })).required().min(0),
    deleteImg: joi.array()
})

module.exports.reviewSchema = joi.object({
    review: joi.object({
        description: joi.string().required().escapeHTML(),
        rating: joi.number().required().min(0).max(5),
    }).required()
})

module.exports.userSchema = joi.object({
    username: joi.string().min(3).max(20).required().escapeHTML(),
    email: joi.string().email().required().escapeHTML(),
    password: joi.string().min(5).max(15).required().escapeHTML()
})

module.exports.userEditSchema = joi.object({
    username: joi.string().min(3).max(20).escapeHTML(),
    email: joi.string().email().escapeHTML(),
    password: joi.string().min(5).max(15).escapeHTML(),
    Oldpassword: joi.string().min(5).max(15).escapeHTML(),
    img: joi.object({
        url: joi.string(),
        filename: joi.string()
    }).min(0)
})