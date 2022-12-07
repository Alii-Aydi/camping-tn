const User = require('../models/user')

module.exports = {
    renderRegisterForm: (req, res) => {
        res.render('auth/register')
    },
    registerUser: async (req, res) => {
        try {
            const { email, username, password } = req.body
            const user = new User({ email, username })
            const registeredUser = await User.register(user, password)
            req.login(registeredUser, err => {
                if (err) return next(err)
                req.flash('success', `Wellcome to YelpCamp ${username}`)
                res.redirect('/campgrounds')
            })
        } catch (e) {
            req.flash('error', e.message)
            res.redirect('/register')
        }
    },
    renderLoginForm: (req, res) => {
        res.render('auth/login')
    },
    loginUser: (req, res) => {
        const { username } = req.body
        let redirectUrl = '/campgrounds'
        if (req.session.back) {
            if (!req.session.back.includes('/reviews')) {
                redirectUrl = req.session.back
            } else {
                redirectUrl = req.session.back.slice(0, 38)
            }
            delete req.session.back
        }
        req.flash('success', `welcome back ${username}`);
        res.redirect(redirectUrl);
    },
    logoutUser: (req, res) => {
        req.logout(err => {
            if (err) return next(err);
            req.flash('success', 'You logged out');
            res.redirect("/campgrounds");
        });
    }
}