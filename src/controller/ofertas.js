const pool = require('../database')
const model = require('../Models/index.js');
const ofertas = {}


ofertas.crearOfertaView = (req, res) => {
	var idLogin
	pool.query('SELECT * FROM preventa WHERE usuario_ID= ?', [idLogin], (err, preventa) => {
		if (err) {
			res.json(err);
		}
		res.render('perfil', {
			data: preventa
		})
	})

}

module.exports= ofertas; 