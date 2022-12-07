const express = require('express')
const router = express.Router()
const CatchAsync = require('../utils/CatchAsync')
const { isLoggedIn, isAuthor, valdCamp, redirect, pagination } = require('../middelwares')
const campController = require('../controllers/campController')
const { storage } = require('../cloudinary/cloud')
const multer = require('multer')
const upload = multer({ storage })
const Campground = require('../models/campground')


//Note: multer is responsiball for req.body now
router.route('/')
    .get(pagination(Campground), CatchAsync(campController.renderIndex))
    .post(isLoggedIn, upload.array('campground[img]'), valdCamp, CatchAsync(campController.createCampground))

router.get('/new', isLoggedIn, campController.renderNewForm)

router.route('/:id')
    .get(redirect, CatchAsync(campController.renderShowPage))
    .patch(isLoggedIn, isAuthor, upload.array('campground[img]'), valdCamp, CatchAsync(campController.editCampground))
    .delete(isLoggedIn, isAuthor, redirect, CatchAsync(campController.deleteCampground))

router.get('/:id/edit', isLoggedIn, isAuthor, CatchAsync(campController.renderEditPage))

module.exports = router;