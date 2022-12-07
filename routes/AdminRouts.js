const express = require('express')
const router = express.Router({ mergeParams: true })
const CatchAsync = require('../utils/CatchAsync')
// const reviewController = require('../controllers/reviewController')
const { isLoggedIn, isAdmin } = require('../middelwares')
const User = require('../models/user')
const Campground = require('../models/campground')
const Review = require('../models/review')
const { cloudinary } = require('../cloudinary/cloud')

router.get('/users', isLoggedIn, isAdmin, async (req, res) => {
    const users = await User.find({})
    let i = 0
    const nbrArray = []
    let prom = new Promise((res, rej) => {
        users.forEach(async (user, index, array) => {
            const camps = await Campground.find({ author: user._id })
            for (let camp of camps) {
                i++
            }
            nbrArray.push(i)
            i = 0
            if (index === array.length - 1) res()
        })
    })
    prom.then(() => {
        return res.render('Admin/allusers', { users, title: "Users", nbrArray })
    })
})

router.all('/users/applie', isLoggedIn, isAdmin, async (req, res) => {
    if (req.body.deleteUser) {
        for (let idUser of req.body.deleteUser) {
            const user = await User.findById(idUser)
            const camp = await Campground.find({ author: idUser })
            if (user.img.filename) await cloudinary.uploader.destroy(user.img.filename)
            for (let obj of camp) {
                for (let img of obj.img) {
                    await cloudinary.uploader.destroy(img.filename)
                }
            }
            await User.findByIdAndDelete(idUser)
        }
    }
    res.redirect('/Admin/users')
})

router.get('/campgrounds', isLoggedIn, isAdmin, async (req, res) => {
    const camps = await Campground.find({}).populate('author')
    return res.render('Admin/campgrounds', { camps, title: "Posts" })
})

router.all('/campgrounds/applie', isLoggedIn, isAdmin, async (req, res) => {
    if (req.body.deleteCamp) {
        for (let idCamp of req.body.deleteCamp) {
            const campground = await Campground.findById(idCamp)
            for (let img of campground.img) {
                await cloudinary.uploader.destroy(img.filename)
            }
            await Campground.findByIdAndDelete(idCamp)
        }
    }
    res.redirect('/Admin/campgrounds')
})

router.get('/reviews', isLoggedIn, isAdmin, async (req, res) => {
    const revs = await Review.find({}).populate('author').populate('post')
    return res.render('Admin/reviews', { revs, title: "Reviews" })
})

router.all('/reviews/applie', isLoggedIn, isAdmin, async (req, res) => {
    if (req.body.deleteRev) {
        for (let idRev of req.body.deleteRev) {
            await Review.findByIdAndDelete(idRev)
        }
    }
    res.redirect('/Admin/reviews')
})

router.get('/lab', isLoggedIn, isAdmin, async (req, res) => {
    const campgrounds = await Campground.find({})
    return res.render('Admin/lab', { campgrounds, title: "Pending Posts" })
})

router.all('/pendingPosts/applie', isLoggedIn, isAdmin, async (req, res) => {
    if (req.body.deleteCamp) {
        if (req.body.select === 'delete') {
            for (let idCamp of req.body.deleteCamp) {
                const campground = await Campground.findById(idCamp)
                for (let img of campground.img) {
                    await cloudinary.uploader.destroy(img.filename)
                }
                await Campground.findByIdAndDelete(idCamp)
            }
        } else if (req.body.select === 'accept') {
            await Campground.updateMany({ id: { $in: req.body.deleteCamp } }, { $set: { state: 'verified' } })
        }
    }
    res.redirect('/Admin/lab')
})

router.get('/showlab/:id', isLoggedIn, isAdmin, async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findById(id).populate('author')
    res.render('Admin/showlab', { campground })
})

router.get('/verrify/:id', isLoggedIn, isAdmin, async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findById(id)
    await campground.updateOne({ $set: { state: 'verified' } })
    res.redirect('/Admin/lab')
})

router.delete('/campgrounds/:id', async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findById(id)
    for (let img of campground.img) {
        await cloudinary.uploader.destroy(img.filename)
    }
    await Campground.findByIdAndDelete(id)
    req.flash('success', 'Campground deleted successfully')
    res.redirect(`/Admin/lab`)
})

router.get('/', isLoggedIn, isAdmin, async (req, res) => {
    res.render('Admin/admin')
})


module.exports = router