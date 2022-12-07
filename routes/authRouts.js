const express = require('express')
const router = express.Router()
const CatchAsync = require('../utils/CatchAsync')
const passport = require('passport')
const { valdUser } = require('../middelwares')
const authController = require('../controllers/authController')

router.route('/register')
    .get(authController.renderRegisterForm)
    .post(valdUser, CatchAsync(authController.registerUser))

router.route('/login')
    .get(authController.renderLoginForm)
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login', keepSessionInfo: true }), authController.loginUser)

router.get("/logout", authController.logoutUser);

module.exports = router