const express = require('express')
const router = express.Router({ mergeParams: true })
const CatchAsync = require('../utils/CatchAsync')
// const reviewController = require('../controllers/reviewController')
const { isLoggedIn, isAdmin, valdEditUser, isProfile } = require('../middelwares')
const User = require('../models/user')
const Campground = require('../models/campground')
const { storage } = require('../cloudinary/cloud')
const multer = require('multer')
const upload = multer({ storage })
const { cloudinary } = require('../cloudinary/cloud')

router.get('/:id', async (req, res) => {
    const { id } = req.params
    const user = await User.findById(id)
    if (!user) {
        req.flash('error', 'Can\'t find user')
        return res.redirect(`/campgrounds`)
    }
    const campgrounds = await Campground.find({ author: id })
    res.render('auth/profile', { user, campgrounds })
})

router.get('/:id/edit', isLoggedIn, isProfile, async (req, res) => {
    const { id } = req.params
    const user = await User.findById(id)
    res.render('auth/editProfile', { user })
})

router.patch('/:id', isLoggedIn, isProfile, upload.single('img'), valdEditUser, CatchAsync(async (req, res) => {
    const { id } = req.params
    const { email, username, password, Oldpassword } = req.body

    const user = await User.findById(id)
    if (username) {
        user.username = username
    }
    if (email) {
        user.email = email
    }
    if (req.file) {
        if (user.img.filename) {
            await cloudinary.uploader.destroy(user.img.filename)
        }
        const { path, filename } = req.file
        const img = { url: path, filename }
        user.img = img
    }
    if (password && Oldpassword) {
        try {
            await user.changePassword(Oldpassword, password)
        } catch {
            req.flash('error', 'Incorrect informations')
            return res.redirect(`/profile/${id}/edit`)
        }
    }
    await user.save()
    req.flash('success', 'successfully saving changes')
    res.redirect(`/profile/${id}`)
}))


module.exports = router