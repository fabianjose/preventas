const express = require('express');
const PassportLocal = require("passport-local").Strategy;
const cookieParser = require("cookie-parser")
const session = require("express-session")
const myConecction = require('express-myconnection')
const pool = require('../database')
const Json2csvParser = require('json2csv').Parser;
const multer = require('multer')
const mimeTypes = require("mime-types")



var idLogin



const passport = require("passport")

//const controlApp = require('../controller/index')

const model = require('../Models/index.js');




const router = express.Router();





var a,b
const storage= multer.diskStorage({
     destination: './src/public/images',
    filename: function (req, file, next) {
          a = Date.now()+ "." + mimeTypes.extension(file.mimetype)
          b=""+a
         next("",a)
    }
})

const upload = multer({
    
storage:storage
})



router.get("/",(req, res, next)=>{
	if(req.isAuthenticated()) return next()
	res.redirect('/login')
}, (req,res)=>{

	
	pool.query('SELECT * FROM preventa WHERE usuario_ID= ?',[idLogin], (err, preventa)=>{
		if(err){
			res.json(err);                    
		}

		res.render('perfil',{
			data:preventa
		})
	})

})


    	




router.get("/usuarios",(req, res, next)=>{
	if(req.isAuthenticated()) return next()
	res.redirect('/login')
}, (req, res)=>{

    
           pool.query('SELECT * FROM usuarios', (err, usuarios)=>{
                if(err){
                    res.json(err);                    
                }

                res.render('usuarios',{
                    data:usuarios
                })
            })
	
})
	



router.get("/login",(req,res)=>{
	res.render("login")
})


router.post("/login",passport.authenticate('local',{
	successRedirect:"/",
	failureRedirect:"/login"
}))

router.get('/logout', function(req, res){
    req.logout();
    res.redirect('/login');
  });


  router.get("/verOfertas",(req, res, next)=>{
	if(req.isAuthenticated()) return next()
	res.redirect('/login')
}, (req, res)=>{

    
           pool.query('SELECT preventa.* , usuarios.nombre FROM preventa INNER JOIN  usuarios ON preventa.usuario_ID = usuarios.id', (err, preventa)=>{

			
                if(err){
                    res.json(err);                    
				}		

                res.render('todasOfertas',{
                    data:preventa
                })
            })
	
})
	

  router.post('/add',  (req, res)=>{

  const datos = req.body;
  pool.query('INSERT INTO usuarios set ?', [datos],(err,usuarioss)=>{
		  res.redirect('usuarios')
	})

})  






	router.get('/update/:id',(req, res, next)=>{
		if(req.isAuthenticated()) return next()
		res.redirect('/login')
	},async (req, res)=>{

		const id=req.params.id;
	   
		
		await		pool.query('SELECT * FROM usuarios WHERE id= ?',[id],(err,usuarios)=>{
	
		res.render('editUsuario',{
				
				data:usuarios[0]
			})
			
		}) 
	})





	
	router.post ('/update/:id', (req, res)=>{
	
		const id=req.params.id;		
		const nuevoUsuario = req.body;

	
		
		pool.query('UPDATE usuarios set ? WHERE id= ? ',[nuevoUsuario,id],(err,rows)=>{
			if(err){
				console.log(err);
			}
		

			res.redirect('/usuarios')
			})
	
	})
	

	router.get( '/delete/:id',  (req, res)=>{
		const id=req.params.id;

			

		pool.query('DELETE FROM usuarios WHERE id= ?',[id],(err,usuarios)=>{
		res.redirect('/usuarios')

		})
						  })




	router.get( '/delete/oferta/:id',  (req, res)=>{
	const id=req.params.id;
	pool.query('DELETE FROM preventa WHERE id= ?',[id],(err,usuarios)=>{
	res.redirect('/')

	})
								})







	 
 
	 router.post('/crearOferta',  (req, res)=>{

		const datosOferta = req.body;
	  pool.query('INSERT INTO preventa set ?', [datosOferta],(err,preventa)=>{
				res.redirect('/')
		  })
	  
	  }) 
	  
  
	  router.get("/ofertasRegistradas",(req, res, next)=>{
		if(req.isAuthenticated()) return next()
		res.redirect('login')
	}, async (req,res)=>{
	
		
	 await		pool.query('SELECT preventa.*, preventa_estatus.descripcion as pdescripcion FROM preventa inner join preventa_estatus on preventa.estatus  = preventa_estatus.id WHERE usuario_ID= ?',[idLogin], (err, preventa)=>{
			if(err){
				res.json(err);                    
			}
	
		res.render('ofertasRegistradas',{
				data:preventa
			})
		})
	
	})


	router.get('/detalles/:id',(req, res, next)=>{
		if(req.isAuthenticated()) return next()
		res.redirect('login')
	}, async (req, res)=>{

		const id=req.params.id;
		const id2=req.params.id;
			var bitacora;
		    	pool.query('SELECT * FROM bitacora WHERE bitacora.preventa_id = ?',id, (err, info)=>{
	          	bitacora=info
	}) 
	setTimeout(function(){
		pool.query('SELECT * FROM preventa WHERE id= ?  ',id2,(err,preventa)=>{
			if(err)console.log(err);

			res.render('detalles',{
			
				dato:preventa,
				bitacora:bitacora
				
				
			})
		})
			

	 }, 500);
		
	
	

	

	})



  	router.get('/ofertasupdate/:id',(req, res, next)=>{
		if(req.isAuthenticated()) return next()
		res.redirect('login')
	}, (req, res)=>{

		const id=req.params.id;
		const id2=req.params.id;
		const id3=req.params.id;
		console.log(id)
		
		var bitacora;
		var ndata
	
		 pool.query('SELECT * FROM bitacora WHERE bitacora.preventa_id = ?',id, (err, info)=>{
			
			bitacora=info
			}) 
			setTimeout(function(){
			
		 	pool.query('SELECT preventa.id  , usuarios.correo  FROM preventa inner join usuarios on preventa.usuario_ID = usuarios.id WHERE preventa.id = ? ',[id3],(err,rows)=>{
				if(err){
					console.log(err);
				}
				console.log(rows);
				ndata=rows;
				
			
		  }) }, 500);



		  setTimeout(function(){
		
					 pool.query('SELECT * FROM preventa WHERE id= ?',[id2],(err,preventa)=>{
							res.render('actualizaroferta',{
									
								data:preventa,
								bitacora:bitacora,
								ndata:ndata
								
								
							})
						
						})  }, 500);
						
					})  

	router.post ('/ofertasupdate/:id', (req, res, next)=>{
		if(req.isAuthenticated()) return next()
		res.redirect('login')
	},  (req, res)=>{
	
		const id=req.params.id;		
		const nuevaPreventa = req.body;
	
			
	


		pool.query('UPDATE preventa set ? WHERE preventa.id= ? ',[nuevaPreventa,id],(err,rows)=>{
			if(err){
				console.log(err);
			}

	
				
			res.redirect('/')
			})
	
	})
	

router.post('/addbitacora/:id',(req,res)=>{
    const id = req.params.id;
    console.log("acavoy ")
    const nuevaBitacora = [[ req.body.detalle , id] ]
    console.log(req.body)
    
      console.log(nuevaBitacora)
    pool.query('insert into bitacora (detalle, preventa_id)  values ?  ', [nuevaBitacora],(err,ff)=>{
          if (err) throw err;
	console.log("Number of records inserted: " + ff.affectedRows);      })
	
	res.redirect('/verOfertas')
    
  })


  router.get('/descargar',(req, res, next)=>{
	if(req.isAuthenticated()) return next()
	res.redirect('login')
}, function(req, res) {
  
	
	pool.query('SELECT * FROM preventa', (err, preventas)=>{
		if(err){
			res.json(err);                    
		}
		const csvFields = ['id'];
		const json2csvParser = new Json2csvParser({ csvFields });
		const csvData = json2csvParser.parse(preventas);
		
		
	  
		// -> Send CSV File to Client
		res.setHeader('Content-disposition', 'attachment; filename=preventas.csv');
		res.set('Content-Type', 'text/csv');
		res.status(200).end(csvData);
		
	})

})

router.get('/descargar/:id', (req, res, next)=>{
	if(req.isAuthenticated()) return next()
	res.redirect('login')
},function(req, res) {
	const id = req.params.id;
	
	pool.query('SELECT * FROM preventa WHERE id = ?' ,id, (err, preventas)=>{
		if(err){
			res.json(err);                    
		}
		const csvFields = ['id'];
		const json2csvParser = new Json2csvParser({ csvFields });
		const csvData = json2csvParser.parse(preventas);
		
		
	  
		// -> Send CSV File to Client
		res.setHeader('Content-disposition', 'attachment; filename=preventa.csv');
		res.set('Content-Type', 'text/csv');
		res.status(200).end(csvData);
		
	})

})


router.get('/meta',(req, res, next)=>{
	console.log(req)
	sql = `select * from usuario_tipos where usuario_tipos.id > 2 and usuario_tipos.id <> 4;
	select *  from categorias;
	 select * from metas;
	 select * from campañas`
	pool.query(sql ,(err,result)=>{
		if(err){
			res.json(err);                    
		}
		console.log(result)
		res.render('meta',
		 { usuario_tipos:result[0],
		 	categorias: result[1],
		 	metas: result[2],
		 	campañas : result[3]
		 })
	})
})


router.get("/dash2", (req,res,next)=>{
	
	pool.query("select usuarios.* from usuarios where id = ? ", [idLogin], (err, usuario)=>{

		sql  = `select distinct campañas.* from campañas 
		inner join preventa on preventa.campaña = campañas.id
		inner join usuarios on usuarios.id = preventa.usuario_ID
		where usuarios.id = ?  `
		pool.query(sql,[idLogin],(err,result)=>{
			res.render('dash2',{campañas : result})
		} )

	})

})


 router.get("/dash2/:camp",(req,res,next)=>{
 	mes_actual = new Date().getMonth()
 	sql0  = `select campañas.nombre, usuarios.nombre as usuario, sum(preventa.tarifa),
 	 MONTH(fecha_agenda) as mes from  campañas
 	inner join preventa on preventa.campaña  = campañas.id  and campañas.id = ?
 	inner join usuarios on usuarios.id =  preventa.usuario_ID where usuarios.id = ?
 	group by MONTH(fecha_agenda) 
 	;
 	select metas.* from metas where mes  = ?
 	`;
 	console.log("dash2/:id")
 	pool.query(sql0, [req.params.camp,idLogin ,mes_actual], (err,result)=>{
 		if(err)console.log(err)
 		console.log(result)
 		res.render("dashboard_single",{mes: mes_actual,datos:result})
 	})
 	
 })
router.post('/meta',(req,res,next)=>{
	sql = "select * from usuario_tipos where usuario_tipos; select * from preventas_categoria;";
	req.body
})

router.get('/asignaMeta/:id', (req, res,next)=>{
	var users
	sql0 = "select * from metas where id = ?"
	sql = "SELECT usuarios.* FROM usuario_meta RIGHT JOIN usuarios on usuarios.id = usuario_meta.usuario left join metas on metas.id = usuario_meta.meta and metas.categoria = ? and metas.mes = ? where usuario_meta.meta is null ; select usuarios.* from usuarios inner join usuario_meta on usuario_meta.usuario = usuarios.id and usuario_meta.meta = ? ;"
	pool.query(sql0,[req.params.id],(error,meta)=>{
		meta = meta[0]
	pool.query(sql, [meta.categoria, meta.mes,req.params.id], (err, usuarios)=>{
		
		if(err){
			res.json(err);                    
		}
		console.log(meta)
		//nsole.log(err.sqlMessage)
		console.log(usuarios)
		users = usuarios[0]
		usuariosAgregados = usuarios[1]
		res.render('asignaMeta',
			{users:users, usuariosAgregados: usuariosAgregados ,meta : meta})

		 })})
	
	

})

router.post('/asignaMeta/:id', (req, res,next)=>{
	var users
	sql0 = "select * from metas where id = ?"
	sql = "SELECT usuarios.* FROM usuario_meta RIGHT JOIN usuarios on usuarios.id = usuario_meta.usuario left join metas on metas.id = usuario_meta.id and metas.categoria = ? and metas.mes = ? where usuario_meta.meta is null ; select usuarios.* from usuarios inner join usuario_meta on usuario_meta.usuario = usuarios.id and usuario_meta.meta = ? ;"
	
	let rr = Array.isArray(req.body.usuarios)? req.body.usuarios : [req.body.usuarios]
	let  meta = req.body.meta 
	let arg =  rr.map(u=> [u,meta])
	console.log(arg)
    pool.query('insert into usuario_meta (usuario, meta)  values ?  ',[arg],(err,ff)=>{
          if (err) throw err;
	console.log("Number of records inserted: " + ff.affectedRows);     
//	pool.query(sql0, )
pool.query(sql0,[req.params.id],(error,meta)=>{
		meta = meta[0]
	pool.query(sql, [meta.categoria, meta.mes,req.params.id], (err, usuarios)=>{
		
		if(err){
			res.json(err);                    
		}
		console.log(meta)
		//nsole.log(err.sqlMessage)
		console.log(usuarios)
		users = usuarios[0]
		usuariosAgregados = usuarios[1]
		res.render('asignaMeta',{users:users, usuariosAgregados: usuariosAgregados ,meta : meta})

		 })})})
	

	
})
router.post ('/foto1/:id', upload.single('foto1'), (req, res, next)=>{
	if(req.isAuthenticated()) return next()
	res.redirect('login')
}, (req, res)=>{
	
	const id=req.params.id;	
	console.log(id);	
    var url_img=b
	console.log(url_img);
    


	
	pool.query('UPDATE preventa set preventa.foto1 = ? WHERE id= ? ',[url_img,id],(err,rows)=>{
		if(err){
			console.log(err);
		}
	

		res.redirect('/detalles/'+id)
		})

})
router.post ('/foto2/:id', upload.single('foto2'), (req, res, next)=>{
	if(req.isAuthenticated()) return next()
	res.redirect('login')
}, (req, res)=>{
	
	const id=req.params.id;	
	console.log(id);	
    var url_img=b
	console.log(url_img);
    


	
	pool.query('UPDATE preventa set preventa.foto2 = ? WHERE id= ? ',[url_img,id],(err,rows)=>{
		if(err){
			console.log(err);
		}
	

		res.redirect('/detalles/'+id)
		})

})
router.post ('/foto3/:id', upload.single('foto3'), (req, res, next)=>{
	if(req.isAuthenticated()) return next()
	res.redirect('login')
}, (req, res)=>{
	
	const id=req.params.id;	
	console.log(id);	
    var url_img=b
	console.log(url_img);
    


	
	pool.query('UPDATE preventa set preventa.foto3 = ? WHERE id= ? ',[url_img,id],(err,rows)=>{
		if(err){
			console.log(err);
		}
	

		res.redirect('/detalles/'+id)
		})

})
router.post ('/foto4/:id', upload.single('foto4'), (req, res, next)=>{
	if(req.isAuthenticated()) return next()
	res.redirect('login')
}, (req, res)=>{
	
	const id=req.params.id;	
	console.log(id);	
    var url_img=b
	console.log(url_img);
    


	
	pool.query('UPDATE preventa set preventa.foto4 = ? WHERE id= ? ',[url_img,id],(err,rows)=>{
		if(err){
			console.log(err);
		}
	

		res.redirect('/detalles/'+id)
		})

})
router.post ('/foto5/:id', upload.single('foto5'), (req, res, next)=>{
	if(req.isAuthenticated()) return next()
	res.redirect('/login')
}, (req, res)=>{
	
	const id=req.params.id;	
	console.log(id);	
    var url_img=b
	console.log(url_img);
    


	
	pool.query('UPDATE preventa set preventa.foto5 = ? WHERE id= ? ',[url_img,id],(err,rows)=>{
		if(err){
			console.log(err);
		}
	

		res.redirect('/detalles/'+id)
		})

})



router.get('/dashboard/:id',(req,res)=>{
	pool.query("select * from campañas where campañas.id =  ? ", [req.params.id],(err,campaña)=>{
		res.render("dashboard_single", {campaña: campaña})
	})

})


router.get('/dashboard',(req, res)=>{
	console.log(new Date().getMonth())

	var users
	var subadmins
	sql1 = "select * from usuarios where usuarios.rol"
	sql  = "SELECT * FROM usuarios inner join where usuarios.rol  ; "
	pool.query('SELECT * FROM usuarios  where usuarios.rol = 6 ',[], (err, usuarios)=>{
		if(err){
			res.json(err);                    
		}
		users_in_home = usuarios

})
	pool.query('SELECT * FROM usuarios  where usuarios.rol = 2 ',[], (err, usuarios)=>{
		if(err){
			res.json(err);                    
		}
		subadmins = usuarios

})
	pool.query('SELECT * FROM preventa ',[idLogin], (err, preventas)=>{
		if(err){
			res.json(err);                    
		}

	res.render('dashboard',{
			dato:preventas,
			subadmins: subadmins,
			usuarios:users_in_home
		})

}) })

			  
passport.use(new PassportLocal(function(username, password, done){	
	
var nombre =username
var clave = password
	pool.query('SELECT * FROM usuarios WHERE nombre= ?',[nombre],(err,usuarios)=>{
			if(err){ console.log(err )
				return
				 }
			if(usuarios.length>0){
				if (usuarios[0].password==clave){
					var user=usuarios[0]
					idLogin=user.id
					return done(null, user)
				}
					
			}
			done(null, false, )


	
			
		})

	

}))


router.get('/prueba', function(req, res){
  res.render("prueba")
})


router.get('/fecha',(req,res)=>{
var a='2021-02-19';
var b='2021-02-24';

	pool.query('SELECT * FROM preventa  WHERE creacion BETWEEN ? AND ?',[a,b], (err, datos)=>{
			
		console.log(datos);
		}) 

	

})

//serializar

passport.serializeUser(function(user, done){
	done(null, user.id)


})

//deserializar
passport.deserializeUser(function(id,done){
	pool.query('SELECT * FROM usuarios WHERE id= ?',[id],(err,usuario)=>{
	
		
		done(null, usuario)	
		
		perfil=usuario
		})
	
	
})
module.exports = router;