
const pool = require('../database')
const model = require('../Models/index.js');
const login = {}


login.check =  (req, res, next) => {
	if (req.isAuthenticated()) return next()
	res.redirect('/login')
}


module.exports= login; 