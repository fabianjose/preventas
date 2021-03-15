
const pool = require('../database')
const model = require('../Models/index.js');
const dashboar = {}


inhouse.all =  (req, res, next)=>{
	sql = "select * from usuarios where rol = 6 ";
	pool.query(sql,[],(err, result)=>{
		res.send(result)
	})
}



module.exports= dashboard;