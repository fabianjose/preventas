const express = require('express');
const PassportLocal = require("passport-local").Strategy;
const cookieParser = require("cookie-parser")
const session = require("express-session")
const myConecction = require('express-myconnection')
const pool = require('../database')
const Json2csvParser = require('json2csv').Parser;
const multer = require('multer')
const mimeTypes = require("mime-types")
const controllerInhouse =  require('../controller/inhouse')
const controllerMetas = require('../controller/metas')
const controllerLogin = require('../controller/login')
var idLogin


const passport = require("passport")

//const controlApp = require('../controller/index')

const model = require('../Models/index.js');


const router = express.Router();


var a, b


router.get("/inhouse",controllerInhouse.all)

const storage = multer.diskStorage({
	destination: './src/public/images',
	filename: function (req, file, next) {
		a = Date.now() + "." + mimeTypes.extension(file.mimetype)
		b = "" + a
		next("", a)
	}
})

const upload = multer({

	storage: storage
})


router.get("/", (req, res, next) => {
	if (req.isAuthenticated()) return next()
	res.redirect('/login')
}, (req, res) => {


	pool.query('SELECT * FROM preventa WHERE usuario_ID= ?', [idLogin], (err, preventa) => {
		if (err) {
			res.json(err);
		}

		res.render('perfil', {
			data: preventa
		})
	})

})


router.get("/campaigns",(req, res, next) => {
	if (req.isAuthenticated()) return next()
	res.redirect('/login')
}, (req, res)=>{
	sql = "select * from campañas";
	pool.query(sql,[], (err, cam)=>{
		res.render("campaigns", {"cams" : cam})
	})
})



router.get("/usuarios", (req, res, next) => {
	if (req.isAuthenticated()) return next()
	res.redirect('/login')
}, (req, res) => {


	pool.query('SELECT * FROM usuarios', (err, usuarios) => {
		if (err) {
			res.json(err);
		}

		res.render('usuarios', {
			data: usuarios
		})
	})

})


router.get("/login", (req, res) => {
	res.render("login")
})



router.post("/login", passport.authenticate('local', {
	successRedirect: "/",
	failureRedirect: "/login"
}))

router.get('/logout', function (req, res) {
	req.logout();
	res.redirect('/login');
});


router.get("/verOfertas", (req, res, next) => {
	if (req.isAuthenticated()) return next()
	res.redirect('/login')
}, (req, res) => {

	pool.query('SELECT preventa.* , usuarios.nombre FROM preventa INNER JOIN  usuarios ON preventa.usuario_ID = usuarios.id', (err, preventa) => {
		if (err) {
			res.json(err);
		}

		res.render('todasOfertas', {
			data: preventa
		})
	})

})


router.post('/add', (req, res) => {

	const datos = req.body;
	pool.query('INSERT INTO usuarios set ?', [datos], (err, usuarioss) => {
		res.redirect('usuarios')
	})

})


router.get('/update/:id', controllerLogin.check, async(req, res) => {

	const id = req.params.id;


	await pool.query('SELECT * FROM usuarios WHERE id= ?', [id], (err, usuarios) => {

		res.render('editUsuario', {

			data: usuarios[0]
		})

	})
})


router.post('/update/:id', (req, res) => {

	const id = req.params.id;
	const nuevoUsuario = req.body;


	pool.query('UPDATE usuarios set ? WHERE id= ? ', [nuevoUsuario, id], (err, rows) => {
		if (err) {
			console.log(err);
		}


		res.redirect('/usuarios')
	})

})


router.get('/delete/:id', (req, res) => {
	const id = req.params.id;


	pool.query('DELETE FROM usuarios WHERE id= ?', [id], (err, usuarios) => {
		res.redirect('/usuarios')

	})
})


router.get('/delete/oferta/:id', (req, res) => {
	const id = req.params.id;
	pool.query('DELETE FROM preventa WHERE id= ?', [id], (err, usuarios) => {
		res.redirect('/')

	})
})


router.post('/crearOferta', (req, res) => {

	const datosOferta = req.body;
	pool.query('INSERT INTO preventa set ?', [datosOferta], (err, preventa) => {
		res.redirect('/')
	})

})


router.get("/ofertasRegistradas", (req, res, next) => {
	if (req.isAuthenticated()) return next()
	res.redirect('login')
}, async(req, res) => {


	await pool.query('SELECT preventa.*, preventa_estatus.descripcion as pdescripcion FROM preventa inner join preventa_estatus on preventa.estatus  = preventa_estatus.id WHERE usuario_ID= ?', [idLogin], (err, preventa) => {
		if (err) {
			res.json(err);
		}

		res.render('ofertasRegistradas', {
			data: preventa
		})
	})

})


router.get('/detalles/:id', (req, res, next) => {
	if (req.isAuthenticated()) return next()
	res.redirect('login')
}, async(req, res) => {

	const id = req.params.id;
	const id2 = req.params.id;
	var bitacora;
	pool.query('SELECT * FROM bitacora WHERE bitacora.preventa_id = ?', id, (err, info) => {
		bitacora = info
	})
	setTimeout(function () {
		pool.query('SELECT * FROM preventa WHERE id= ?  ', id2, (err, preventa) => {
			if (err) console.log(err);

			res.render('detalles', {

				dato: preventa,
				bitacora: bitacora


			})
		})


	}, 500);


})


router.get('/ofertasupdate/:id',controllerLogin.check, (req, res) => {

	const id = req.params.id;
	const id2 = req.params.id;
	const id3 = req.params.id;
	console.log(id)

	var bitacora;
	var ndata

	pool.query('SELECT * FROM bitacora WHERE bitacora.preventa_id = ?', id, (err, info) => {

		bitacora = info
	})
	setTimeout(function () {

		pool.query('SELECT preventa.id  , usuarios.correo  FROM preventa inner join usuarios on preventa.usuario_ID = usuarios.id WHERE preventa.id = ? ', [id3], (err, rows) => {
			if (err) {
				console.log(err);
			}
			console.log(rows);
			ndata = rows;


		})
	}, 500);


	setTimeout(function () {

		pool.query('SELECT * FROM preventa WHERE id= ?', [id2], (err, preventa) => {
			res.render('actualizaroferta', {

				data: preventa,
				bitacora: bitacora,
				ndata: ndata


			})

		})
	}, 500);

})

router.post('/ofertasupdate/:id', (req, res, next) => {
	if (req.isAuthenticated()) return next()
	res.redirect('login')
}, (req, res) => {

	const id = req.params.id;
	const nuevaPreventa = req.body;


	pool.query('UPDATE preventa set ? WHERE preventa.id= ? ', [nuevaPreventa, id], (err, rows) => {
		if (err) {
			console.log(err);
		}


		res.redirect('/')
	})

})


router.post('/addbitacora/:id', (req, res) => {
	const id = req.params.id;
	console.log("acavoy ")
	const nuevaBitacora = [
		[req.body.detalle, id]
	]
	console.log(req.body)

	console.log(nuevaBitacora)
	pool.query('insert into bitacora (detalle, preventa_id)  values ?  ', [nuevaBitacora], (err, ff) => {
		if (err) throw err;
		console.log("Number of records inserted: " + ff.affectedRows);
	})

	res.redirect('/verOfertas')

})


router.get('/descargar', controllerLogin.check, function (req, res) {


	pool.query('SELECT * FROM preventa', (err, preventas) => {
		if (err) {
			res.json(err);
		}
		const csvFields = ['id'];
		const json2csvParser = new Json2csvParser({
			csvFields
		});
		const csvData = json2csvParser.parse(preventas);


		// -> Send CSV File to Client
		res.setHeader('Content-disposition', 'attachment; filename=preventas.csv');
		res.set('Content-Type', 'text/csv');
		res.status(200).end(csvData);

	})

})

router.get('/descargar/:id', (req, res, next) => {
	if (req.isAuthenticated()) return next()
	res.redirect('login')
}, function (req, res) {
	const id = req.params.id;

	pool.query('SELECT * FROM preventa WHERE id = ?', id, (err, preventas) => {
		if (err) {
			res.json(err);
		}
		const csvFields = ['id'];
		const json2csvParser = new Json2csvParser({
			csvFields
		});
		const csvData = json2csvParser.parse(preventas);


		// -> Send CSV File to Client
		res.setHeader('Content-disposition', 'attachment; filename=preventa.csv');
		res.set('Content-Type', 'text/csv');
		res.status(200).end(csvData);

	})

})


router.get('/metas', controllerLogin.check, controllerMetas.metasView)




router.get("/dash2", controllerLogin.check, (req, res, next) => {

	pool.query("select usuarios.* from usuarios where id = ? ", [idLogin], (err, usuario) => {

		sql = `select distinct campañas.* from campañas 
		inner join preventa on preventa.campaña = campañas.id
		inner join usuarios on usuarios.id = preventa.usuario_ID or usuarios.parent = preventa.usuario_ID
		 `
		pool.query(sql, [], (err, result) => {
			res.render('dash2', {
				campañas: result
			})
		})

	})

})


router.get("/estadistica/:id/:hijo/:mes/:year", (req, res, next)=>{
	sql0 = "select * from usuarios where id = ?"
	hijo = req.params.hijo
	mes = req.params.mes
	year = req.params.year
	console.log("api")
	pool.query(sql0, [hijo],(err, usuario) =>{
		if(usuario[0])
		switch(usuario[0].rol){
			case 2:
				console.log("Usuario Admin")
				sql = `select sum(tarifa) as monto,
				MONTH(fecha_agenda) - 1 as mes,
				 estatus, categorias.id as categoria,
				 YEAR(fecha_agenda) as year
				 from preventa 
				 inner join usuarios on preventa.usuario_ID = usuarios.id and usuarios.rol = 6 and  YEAR(fecha_agenda) = ? and usuarios.parent = ?
				 inner join campañas on campañas.id = preventa.campaña  and campañas.id = ?
				 inner join categorias on categorias.id = preventa.categoria
				 group by MONTH(fecha_agenda) ,categorias.id, YEAR(fecha_agenda),preventa.estatus;

				SELECT DISTINCT sum(metas.tarifa) as monto, 
				metas.categoria as categoria,
				metas.mes as mes
				FROM usuario_meta inner join metas on metas.id = usuario_meta.meta
				inner join usuarios on usuario_meta.usuario = usuarios.id and parent = ?
				inner join campañas on campañas.id = metas.campaña  and campaña = ? 
				GROUP by mes, metas.categoria

				 `
				pool.query(sql, [year,usuario[0].id, req.params.id,usuario[0].id, req.params.id],(err, result)=>{
					arreglo = []
					if (err) {
						console.log(err)
					}
					console.log(result)
					arreglo2 = []
					for (i = 0; i < 12; i++) {
						arreglo[i] = []
						arreglo2[i] = []
						for(z = 0; z <= 3; z++){
							arreglo2[i][z] = 0
							arreglo[i][z] = []
							for (j = 0; j < 6; j++) {
								arreglo[i][z][j] = 0;
							}
						}
					}			
					result[0].forEach(r =>{
						arreglo[r.mes][r.categoria][r.estatus] = r.monto
					})
					result[1].forEach(r=>{ arreglo2[r.mes][r.categoria] = r.monto })
					respuesta  = { metas: arreglo2 , ventas:arreglo}
					console.log(respuesta)
					res.json(respuesta)
				})
				break;
			case 3:
				console.log("Usuario sub-Admin")
				sql = `select sum(tarifa) as monto,
				MONTH(fecha_agenda) - 1 as mes,
				 estatus, categorias.id as categoria,
				 YEAR(fecha_agenda) as year
				 from preventa 
				 inner join usuarios on preventa.usuario_ID = usuarios.id and usuarios.rol = 5 and usuarios.parent = ?
				 inner join campañas on campañas.id = preventa.campaña  and campañas.id = ?
				 inner join categorias on categorias.id = preventa.categoria
				 group by MONTH(fecha_agenda) ,categorias.id, YEAR(fecha_agenda),preventa.estatus;
				SELECT DISTINCT sum(metas.tarifa) as monto, 
				metas.categoria as categoria,
				metas.mes as mes
				FROM usuario_meta inner join metas on metas.id = usuario_meta.meta
				inner join usuarios on usuario_meta.usuario = usuarios.id and parent = ?
				inner join campañas on campañas.id = metas.campaña  and campaña = ? 
				GROUP by mes, metas.categoria

				 `
				pool.query(sql, [usuario[0].id, req.params.id,usuario[0].id, req.params.id],(err, result)=>{
					arreglo = []
					if (err) {
						console.log(err)
					}
					console.log(result)
					arreglo2 = []
					for (i = 0; i < 12; i++) {
						arreglo[i] = []
						arreglo2[i] = []
						for(z = 0; z <= 3; z++){
							arreglo2[i][z] = 0
							arreglo[i][z] = []
							for (j = 0; j < 6; j++) {
								arreglo[i][z][j] = 0;
							}
						}
					}			
					result[0].forEach(r =>{
						arreglo[r.mes][r.categoria][r.estatus] = r.monto
					})
					result[1].forEach(r=>{ arreglo2[r.mes][r.categoria] = r.monto })
					respuesta  = { metas: arreglo2 , ventas:arreglo}
					console.log(respuesta)
					res.json(respuesta)
				})
				break;
			case 6: //
				console.log("Usuario In-house")
				sql = `select sum(tarifa) as monto,
				MONTH(fecha_agenda) - 1 as mes,
				 estatus, categorias.id as categoria,
				 YEAR(fecha_agenda) as year
				 from preventa 
				 inner join usuarios on preventa.usuario_ID = usuarios.id and usuarios.rol = 6 and  YEAR(fecha_agenda) = ? and usuarios.id = ?
				 inner join campañas on campañas.id = preventa.campaña  and campañas.id = ?
				 inner join categorias on categorias.id = preventa.categoria
				 group by MONTH(fecha_agenda) ,categorias.id, YEAR(fecha_agenda),preventa.estatus;

				SELECT DISTINCT sum(metas.tarifa) as monto, 
				metas.categoria as categoria,
				metas.mes as mes
				FROM usuario_meta inner join metas on metas.id = usuario_meta.meta
				inner join usuarios on usuario_meta.usuario = usuarios.id and  usuarios.id = ?
				inner join campañas on campañas.id = metas.campaña  and campaña = ? 
				GROUP by mes, metas.categoria

				 `
				pool.query(sql, [year,usuario[0].id, req.params.id,usuario[0].id, req.params.id],(err, result)=>{
					arreglo = []
					if (err) {
						console.log(err)
					}
					console.log(result)
					arreglo2 = []
					for (i = 0; i < 12; i++) {
						arreglo[i] = []
						arreglo2[i] = []
						for(z = 0; z <= 3; z++){
							arreglo2[i][z] = 0
							arreglo[i][z] = []
							for (j = 0; j < 6; j++) {
								arreglo[i][z][j] = 0;
							}
						}
					}			
					result[0].forEach(r =>{
						arreglo[r.mes][r.categoria][r.estatus] = r.monto
					})
					result[1].forEach(r=>{ arreglo2[r.mes][r.categoria] = r.monto })
					respuesta  = { metas: arreglo2 , ventas:arreglo}
					console.log(respuesta)
					res.json(respuesta)
				})
				break;
			}
	})
	
})



router.get("/dash2/:camp", controllerLogin.check, (req, res, next) => {

	sql00 = "select * from usuarios where id = ?"
	pool.query(sql00, [idLogin],(err, usuario) =>{
		
	mes_actual = new Date().getMonth()
	año_actual = new Date().getFullYear()

	sql0 = `select distinct campañas.nombre, usuarios.nombre as usuario, sum(preventa.tarifa) as monto,
 	 MONTH(fecha_agenda) as mes, preventa.estatus from  campañas
 	inner join preventa on preventa.campaña  = campañas.id  and campañas.id = ?
 	inner join categorias on preventa.categoria  = categorias.id and categorias.id = '1'
 	inner join usuarios on usuarios.id =  preventa.usuario_ID where usuarios.parent = ?
 	group by MONTH(fecha_agenda), preventa.estatus
 	;
 	select distinct campañas.nombre, usuarios.nombre as usuario, sum(preventa.tarifa) as monto,
 	 MONTH(fecha_agenda) as mes, preventa.estatus from  campañas
 	inner join preventa on preventa.campaña  = campañas.id  and campañas.id = ?
 	inner join categorias on preventa.categoria  = categorias.id and categorias.id = '2'
 	inner join usuarios on usuarios.id =  preventa.usuario_ID where usuarios.id = ?
 	
 	group by MONTH(fecha_agenda) , preventa.estatus;
 	select distinct campañas.nombre, usuarios.nombre as usuario, sum(preventa.tarifa) as monto,
 	 MONTH(fecha_agenda) as mes, preventa.estatus from  campañas
 	inner join preventa on preventa.campaña  = campañas.id  and campañas.id = ?
 	inner join categorias on preventa.categoria  = categorias.id and categorias.id = '3'
 	inner join usuarios on usuarios.id =  preventa.usuario_ID where usuarios.id = ?
 	group by MONTH(fecha_agenda), preventa.estatus;


 	select  metas.*,categorias.id as categoriaid from usuario_meta
 	inner join metas on metas.id = usuario_meta.meta  and mes  = ? and año  = ?
 	right join categorias on categorias.id = metas.categoria
 	group by categorias.id order by categoriaid asc;
 	select * from usuarios where id = ?;
 	`;
 	switch(usuario[0].rol){
 		case 1:
 			sql03 = "select * from usuarios where rol  = 3 or rol = 6 or rol = 2;"
 			break
 		case 2:
 			sql03 = "select * from usuarios where rol = 6 or rol = 3;"
 		case 3:
 		case 4:
 		case 5:
 		case 6:
 	}
 	sql0+=sql03

 //	console.log(user)
	pool.query(sql0, [req.params.camp, idLogin,
		req.params.camp, idLogin,
		req.params.camp, idLogin,
		mes_actual, año_actual,
		idLogin, idLogin
	], (err, result) => {
		if (err) console.log(err)
		console.log(result)
		res.render("dashboard_single", {
			usuario: result[4],
			mes: mes_actual,
			year: año_actual,
			data_hogar: result[0],
			data_pyme: result[1],
			data_avanzado: result[2],
			data_metas: result[3],
			datos: result,
			'campaña': result[0].nombre,
			hijos:result[5]
		})
	})
})

})
router.post('/metas',
	controllerLogin.check, controllerMetas.nuevaMeta,controllerMetas.metasView)

router.get('/asignaMeta/:id',controllerLogin.check, controllerMetas.asignaMetaView)




router.post('/asignaMeta/:id', 
	controllerLogin.check,
	controllerMetas.asignaMeta, 
	controllerMetas.asignaMetaView
	)

router.post("/desasignaMeta",
	controllerLogin.check
	, controllerMetas.desasignaMeta)



router.post('/foto1/:id', upload.single('foto1'), (req, res, next) => {
	if (req.isAuthenticated()) return next()
	res.redirect('login')
}, (req, res) => {

	const id = req.params.id;
	console.log(id);
	var url_img = b
	console.log(url_img);


	pool.query('UPDATE preventa set preventa.foto1 = ? WHERE id= ? ', [url_img, id], (err, rows) => {
		if (err) {
			console.log(err);
		}


		res.redirect('/detalles/' + id)
	})

})
router.post('/foto2/:id', upload.single('foto2'), (req, res, next) => {
	if (req.isAuthenticated()) return next()
	res.redirect('login')
}, (req, res) => {

	const id = req.params.id;
	console.log(id);
	var url_img = b
	console.log(url_img);


	pool.query('UPDATE preventa set preventa.foto2 = ? WHERE id= ? ', [url_img, id], (err, rows) => {
		if (err) {
			console.log(err);
		}


		res.redirect('/detalles/' + id)
	})

})
router.post('/foto3/:id', upload.single('foto3'), (req, res, next) => {
	if (req.isAuthenticated()) return next()
	res.redirect('login')
}, (req, res) => {

	const id = req.params.id;
	console.log(id);
	var url_img = b
	console.log(url_img);


	pool.query('UPDATE preventa set preventa.foto3 = ? WHERE id= ? ', [url_img, id], (err, rows) => {
		if (err) {
			console.log(err);
		}
		res.redirect('/detalles/' + id)
	})

})
router.post('/foto4/:id', upload.single('foto4'), (req, res, next) => {
	if (req.isAuthenticated()) return next()
	res.redirect('login')
}, (req, res) => {

	const id = req.params.id;
	console.log(id);
	var url_img = b
	console.log(url_img);


	pool.query('UPDATE preventa set preventa.foto4 = ? WHERE id= ? ', [url_img, id], (err, rows) => {
		if (err) {
			console.log(err);
		}


		res.redirect('/detalles/' + id)
	})

})
router.post('/foto5/:id', upload.single('foto5'), 
	controllerLogin.check,
 	(req, res) => {
	const id = req.params.id;
	console.log(id);
	var url_img = b
	console.log(url_img);
	pool.query('UPDATE preventa set preventa.foto5 = ? WHERE id= ? ', [url_img, id], (err, rows) => {
		if (err) {
			console.log(err);
		}


		res.redirect('/detalles/' + id)
	})

})


router.get('/dashboard', (req, res) => {
	console.log(new Date().getMonth())

	var users
	var subadmins
	sql1 = "select * from usuarios where usuarios.rol"
	sql = "SELECT * FROM usuarios inner join where usuarios.rol  ; "
	pool.query('SELECT * FROM usuarios  where usuarios.rol = 6 ', [], (err, usuarios) => {
		if (err) {
			res.json(err);
		}
		users_in_home = usuarios

	})
	pool.query('SELECT * FROM usuarios  where usuarios.rol = 2 ', [], (err, usuarios) => {
		if (err) {
			res.json(err);
		}
		subadmins = usuarios

	})
	pool.query('SELECT * FROM preventa ', [idLogin], (err, preventas) => {
		if (err) {
			res.json(err);
		}

		res.render('dashboard', {
			dato: preventas,
			subadmins: subadmins,
			usuarios: users_in_home
		})

	})
})


passport.use(new PassportLocal(function (username, password, done) {

	var nombre = username
	var clave = password
	pool.query('SELECT * FROM usuarios WHERE nombre= ?', [nombre], (err, usuarios) => {
		if (err) {
			console.log(err)
			return
		}
		if (usuarios.length > 0) {
			if (usuarios[0].password == clave) {
				var user = usuarios[0]
				idLogin = user.id
				return done(null, user)
			}

		}
		done(null, false, )


	})


}))


router.get('/fecha', (req, res) => {
	var a = '2021-02-19';
	var b = '2021-02-24';

	pool.query('SELECT * FROM preventa  WHERE creacion BETWEEN ? AND ?', [a, b], (err, datos) => {
		console.log(datos);
	})
})

//serializar

passport.serializeUser(function (user, done) {
	done(null, user.id)
})

//deserializar
passport.deserializeUser(function (id, done) {
	pool.query('SELECT * FROM usuarios WHERE id= ?', [id], (err, usuario) => {
		done(null, usuario)
		perfil = usuario
	})
})

module.exports = router;