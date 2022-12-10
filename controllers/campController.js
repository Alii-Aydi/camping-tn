const Campground = require('../models/campground')
const { cloudinary } = require('../cloudinary/cloud')
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding')

const mapBoxToken = process.env.MAPBOX_TOKEN
const geoCoder = mbxGeocoding({ accessToken: mapBoxToken })

module.exports = {
    renderIndex: async (req, res) => {
        let campss;
        if (req.query.searchBar) {
            campss = await Campground.find({ title: { $regex: req.query.searchBar, $options: "i" }, state: 'verified' })
        } else {
            campss = await Campground.find({ state: 'verified' })
        }
        let camps = campss.length;
        const campgrounds = res.paginatedResults.results
        const results = res.paginatedResults
        results.searchBar = req.query.searchBar
        results.pages = Math.ceil(camps / results.limit)
        res.render('campgrounds/index', { campgrounds, camps, results })
    },
    renderNewForm: (req, res) => {
        res.render('campgrounds/new')
    },
    renderShowPage: async (req, res) => {
        const { id } = req.params
        const campground = await Campground.findById(id).populate({
            path: 'reviews',
            populate: {
                path: 'author'
            }
        }).populate('author')
        if (!campground) {
            req.flash('error', 'This campground is not available ')
            return res.redirect('/campgrounds')
        }
        res.render('campgrounds/show', { campground })
    },
    createCampground: async (req, res, next) => {
        const geoData = await geoCoder.forwardGeocode({
            query: req.body.campground.location,
            limit: 1
        }).send()
        const campground = new Campground(req.body.campground)
        campground.geometry = geoData.body.features[0].geometry
        campground.img = req.files.map(el => ({ url: el.path, filename: el.filename }))
        campground.author = req.user._id
        if (req.user.role === 'Admin') {
            campground.state = 'verified'
            await campground.save()
            req.flash('success', 'Successfully made a new campground')
            return res.redirect(`/campgrounds/${campground._id}`)
        }
        await campground.save()
        req.flash('success', 'Successfully made a new campground .Your campground will be added after the confirmation of the Administration')
        res.redirect(`/campgrounds/${campground._id}`)
    },
    renderEditPage: async (req, res) => {
        const { id } = req.params
        const campground = await Campground.findById(id)
        if (!campground) {
            req.flash('error', 'Cannot find campground')
            return res.redirect(`/campgrounds`)
        }
        res.render('campgrounds/edit', { campground })
    },
    editCampground: async (req, res) => {
        const { id } = req.params
        const updateCampground = await Campground.findByIdAndUpdate(id, { ...req.body.campground })
        const geoData = await geoCoder.forwardGeocode({
            query: req.body.campground.location,
            limit: 1
        }).send()
        updateCampground.geometry = geoData.body.features[0].geometry
        const imgs = req.files.map(el => ({ url: el.path, filename: el.filename }))
        updateCampground.img.push(...imgs)
        await updateCampground.save()
        if (req.body.deleteImg) {
            const deltimg = req.body.deleteImg.map(img => img.trim())
            for (let filename of req.body.deleteImg) {
                await cloudinary.uploader.destroy(filename)
            }
            await updateCampground.updateOne({ $pull: { img: { filename: { $in: deltimg } } } })
        }
        req.flash('success', 'Campground modified successfully')
        res.redirect(`/campgrounds/${id}`)
    },
    deleteCampground: async (req, res) => {
        const { id } = req.params
        const campground = await Campground.findById(id)
        for (let img of campground.img) {
            await cloudinary.uploader.destroy(img.filename)
        }
        await Campground.findByIdAndDelete(id)
        req.flash('success', 'Campground deleted successfully')
        res.redirect(`/campgrounds`)
    }
}