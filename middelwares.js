const { campSchema, reviewSchema, userSchema, userEditSchema } = require('./schemas')
const ExpressError = require('./utils/expressError')
const Campground = require('./models/campground')
const Review = require('./models/review')

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.back = req.originalUrl
        req.flash('error', 'You need to be loged in')
        return res.redirect('/login')
    }
    next()
}

module.exports.redirect = (req, res, next) => {
    req.session.back = req.originalUrl
    next()
}

module.exports.valdCamp = (req, res, next) => {
    const img = req.files.map(el => ({ url: el.path, filename: el.filename }))
    const { error } = campSchema.validate({ ...req.body, img });
    if (error) {
        const msg = error.details.map(el => el.message).join(', ')
        req.flash('error', msg)
        res.redirect('/campgrounds/new')
    } else {
        next()
    }
}

module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params
    const campground = await Campground.findById(id)
    if (!campground.author.equals(req.user._id) && req.user.role !== "Admin") {
        req.flash('error', 'You don\'t have Permission')
        return res.redirect(`/campgrounds/${id}`)
    }
    next()
}

module.exports.isRevAuthor = async (req, res, next) => {
    const { id, revId } = req.params
    const rev = await Review.findById(revId)
    if (!rev.author.equals(req.user._id) && req.user.role !== "Admin") {
        req.flash('error', 'You don\'t have Permission')
        return res.redirect(`/campgrounds/${id}`)
    }
    next()
}

module.exports.valdReview = (req, res, next) => {
    const { id } = req.params
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(', ')
        req.flash('error', msg)
        res.redirect(`/campgrounds/${id}`)
    } else {
        next()
    }
}

module.exports.valdUser = (req, res, next) => {
    const { error } = userSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(', ')
        req.flash('error', msg)
        res.redirect('/register')
    } else {
        next()
    }
}

module.exports.valdEditUser = (req, res, next) => {
    const { error } = userEditSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(', ')
        req.flash('error', msg)
        res.redirect(`/profile/${req.params.id}/edit`)
    } else {
        next()
    }
}

module.exports.isAdmin = async (req, res, next) => {
    if (!(req.user.role === "Admin")) {
        req.flash('error', 'You don\'t have Permission')
        return res.redirect('/campgrounds')
    }
    next()
}

module.exports.isProfile = async (req, res, next) => {
    if (!(req.user._id.toString().trim() === req.params.id.toString().trim())) {
        req.flash('error', 'You don\'t have Permission')
        return res.redirect(`/profile/${req.params.id}`)
    }
    next()
}


module.exports.pagination = (model) => {
    return async (req, res, next) => {
        let page = parseInt(req.query.page)
        let limit = parseInt(req.query.limit)
        if (!page || !limit) {
            page = 1
            limit = 3
        }
        const startIndex = (page - 1) * limit
        const endIndex = page * limit

        const results = {}

        results.current = page
        results.limit = limit

        if (endIndex < await model.countDocuments().exec()) {
            results.next = {
                page: page + 1,
                limit: limit
            }
        }

        if (startIndex > 0) {
            results.previous = {
                page: page - 1,
                limit: limit
            }
        }
        try {
            if (model === Campground) {
                let campgrounds;
                if (req.query.searchBar) {
                    campgrounds = await Campground.find({ title: { $regex: req.query.searchBar, $options: "i" }, state: 'verified' }).limit(limit).skip(startIndex).exec()
                } else {
                    campgrounds = await Campground.find({ state: 'verified' }).limit(limit).skip(startIndex).exec()
                }
                //fix for searshBar
                let camps = campgrounds.length;
                results.next = null
                if (endIndex < camps) {
                    results.next = {
                        page: page + 1,
                        limit: limit
                    }
                }
                //
                results.results = campgrounds
                res.paginatedResults = results
                next()
            }
        } catch (e) {
            throw new ExpressError(500, `SearshBar err => ${e}`)
        }
    }
}