const express = require('express')
const router = express.Router({ mergeParams: true })
const CatchAsync = require('../utils/CatchAsync')
const reviewController = require('../controllers/reviewController')
const { valdReview, isLoggedIn, isRevAuthor } = require('../middelwares')

router.post('/', isLoggedIn, valdReview, CatchAsync(reviewController.createReview))

router.delete('/:revId', isLoggedIn, isRevAuthor, CatchAsync(reviewController.deleteReview))

module.exports = router;