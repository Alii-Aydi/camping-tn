//Librairies
const Campground = require('./models/campground')
const express = require('express')
const app = express()
const path = require('path')
const mongoose = require('mongoose')
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate')
const ExpressError = require('./utils/expressError')
const session = require('express-session')
const flash = require('connect-flash')
const passport = require('passport')
const localStrategy = require('passport-local')
const User = require('./models/user')
const mongoSanitize = require('express-mongo-sanitize')
const MongoStore = require('connect-mongo')
if (process.env.NODE_ENV != "production") {
    require('dotenv').config();
}

//Mongoose connection set up

//'mongodb://localhost:27017/yelpcamp'
//process.env.ATLAS_URL
const dbURL = process.env.ATLAS_URL
main().catch(err => console.log(err));
async function main() {
    await mongoose.connect(dbURL);
}

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});


//Set up midellwares

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.engine('ejs', ejsMate)

app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, 'public')))
app.use(mongoSanitize({
    replaceWith: ' ',
}))


//session and flash config

const sessionConfig = {
    store: MongoStore.create({
        mongoUrl: dbURL,
        touchAfter: 24 * 3600
    }),
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + (1000 * 60 * 60 * 24 * 7),
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true
    }
}
app.use(session(sessionConfig))
app.use(flash())


//Pssport config

app.use(passport.initialize())
app.use(passport.session())
passport.use(new localStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())


//locals

app.use((req, res, next) => {
    res.locals.url = req.originalUrl
    res.locals.currentUser = req.user
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next()
})


//Main route

app.get('/', (req, res) => {
    res.render('home')
})


//Campgrounds routs

const campgrounds = require('./routes/campgroundsRoutes')
app.use("/campgrounds", campgrounds)


//Reviews routs

const reviews = require('./routes/reviewsRoutes')
app.use("/campgrounds/:id/reviews", reviews)


//Auth routs

const auth = require('./routes/authRouts')
app.use("/", auth)


//Admin routs

const admin = require('./routes/AdminRouts')
app.use("/Admin", admin)


//Profiles routs

const profiles = require('./routes/profilesRoutes')
app.use("/profile", profiles)


//Api

app.get('/getcamp/:id', async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findById(id)
    res.send(campground)
})

app.get('/getcamps', async (req, res) => {
    const campgrounds = await Campground.find({ state: 'verified' })
    res.send(campgrounds)
})

//Error's midellwares

app.all('*', (req, res, next) => {
    next(new ExpressError(404, 'Page not found 404'))
})

app.use((err, req, res, next) => {
    const { status = 500, message = 'somthing went whrong' } = err
    if (!err.message) err.message = 'somthing went whrong'
    res.status(status).render('error', { err })
})


//Start server

const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log('connection opened')
})