//CatchAsync is for mongodb, passport and server echos
module.exports = func => {
    return (req, res, next) => {
        func(req, res, next).catch(e => next(e))
    }
}