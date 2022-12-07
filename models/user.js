const mongoose = require('mongoose')
const passportLocalMongoose = require('passport-local-mongoose')
const Campground = require('./campground')
const Review = require('./review')

const Schema = mongoose.Schema

const Userschema = new Schema({
    email: {
        type: String,
        require: true,
        unique: true
    },
    role: {
        type: String,
        enum: ["Admin", "Member", "writer"],
        default: "Member",
        require: true
    },
    img: {
        url: String,
        filename: String
    }
})

Userschema.post('findOneAndDelete', async function (data) {
    if (data) {
        await Campground.deleteMany({
            author: data._id
        })
        await Review.deleteMany({
            author: data._id
        })
    }
})

//add fiealds in the schema for (unique) username and password
Userschema.plugin(passportLocalMongoose)

module.exports = mongoose.model('User', Userschema)