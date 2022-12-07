const Review = require('../models/review')
const Campground = require('../models/campground')

module.exports = {
    createReview: async (req, res) => {
        const campground = await Campground.findById(req.params.id)
        if (campground.state !== 'verified') {
            req.flash('error', 'Post not verrified yet')
            return res.redirect(`/campgrounds/${campground._id}`)
        }
        const review = new Review(req.body.review);
        review.author = req.user._id
        review.post = campground._id
        campground.reviews.push(review)
        await review.save()
        await campground.save()
        req.flash('success', 'Your review has created successfully')
        res.redirect(`/campgrounds/${campground._id}`)
    },
    deleteReview: async (req, res) => {
        const { id, revId } = req.params
        await Campground.findByIdAndUpdate(id, { $pull: { reviews: revId } })
        await Review.findByIdAndDelete(revId)
        req.flash('success', 'Review deleted successfully')
        res.redirect(`/campgrounds/${id}`)
    }
}