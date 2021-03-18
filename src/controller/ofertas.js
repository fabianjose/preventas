const pool = require('../database')
const model = require('../Models/index.js');
const ofertas = {}


ofertas.crearOfertaView = (req, res) => {
	var idLogin
	pool.query('SELECT * FROM campañas; SELECT * FROM categorias',[], (err, r) => {
		if (err) {
			res.json(err);
		}
		res.render('perfil', {
			camps: r[0],
			categorias: r[1]
		})
	})

}

module.exports= ofertas; 