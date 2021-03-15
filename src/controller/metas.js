
const pool = require('../database')
const model = require('../Models/index.js');
const metas = {}


metas.asigna =  (req, res, next)=>{
	sql = "select * from usuarios where rol = 6 ";
	pool.query(sql,[],(err, result)=>{
		res.send(result)
	})
}


metas.asignaMetaView = (req, res, next) => {
	var users
	sql0 = "select * from metas where id = ?"
	sql = `SELECT  usuarios.id, usuarios.nombre FROM  usuarios
	left join usuario_meta on usuario_meta.usuario = usuarios.id
	inner join usuarios as u2 on usuarios.id = u2.id and ( u2.rol = 3 or u2.rol = 6)
	left join metas on metas.id = usuario_meta.meta and metas.categoria = ? and metas.mes = ?  and metas.año = ?
	group by usuarios.id, usuarios.nombre having (count(metas.id)  = 0) ;
	
	select distinct usuarios.*, usuario_meta.id as idMeta  from usuarios 
	inner join usuario_meta on usuario_meta.usuario = usuarios.id and usuario_meta.meta = ? ;`
	pool.query(sql0, [req.params.id], (error, meta) => {
		meta = meta[0]
		pool.query(sql, [meta.categoria, meta.mes,meta.año, req.params.id], (err, usuarios) => {

			if (err) {
				res.json(err);
			}
			console.log(err)
			users = usuarios[0]
			usuariosAgregados = usuarios[1]
			res.render('asignaMeta', {
				users: users,
				usuariosAgregados: usuariosAgregados,
				meta: meta
			})

		})
	})
}
 metas.asignaMeta =  (req, res, next) => {
	var users
	let rr = Array.isArray(req.body.usuarios) ? req.body.usuarios : [req.body.usuarios]
	let meta = req.body.meta
	let arg = rr.map(u => [u, meta])
	console.log(arg)
	pool.query('insert into usuario_meta (usuario, meta)  values ?  ', [arg], (err, ff) => {
		if (err) throw err;
		console.log("Number of records inserted: " + ff.affectedRows);
		next()
	})
}


metas.desasignaMeta = (req, res, next) => {
	id = req.body.id
	sql = "delete from usuario_meta where id = ?"
	console.log(id)
	pool.query(sql,[id],(err,result)=>{
		if(err){
			res.send(0)
		}else res.send("ok")
	})
}

metas.sinmeta  =  (req, res, next)=>{ // usuarios sin meta en :categoria :mes :año
	/*sql = "select * from usuarios where rol = 6 ";
	pool.query(sql,[],(err, result)=>{
		res.send(result)
	})*/
}
module.exports= metas; 