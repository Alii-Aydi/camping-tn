const express = require('express')
const router = express.Router()
const CatchAsync = require('../utils/CatchAsync')

router.get('/', (req, res) => {
    res.render('shop/landing')
})


module.exports = router