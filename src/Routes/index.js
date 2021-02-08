const express = require('express');
const PassportLocal = require("passport-local").Strategy;
const cookieParser = require("cookie-parser")
const session = require("express-session")
const myConecction = require('express-myconnection')
const pool = require('../database')
var idLogin



const passport = require("passport")

//const controlApp = require('../controller/index')

const model = require('../Models/index.js');




const router = express.Router();



router.get("/",(req, res, next)=>{
	if(req.isAuthenticated()) return next()
	res.redirect('login')
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
	res.redirect('login')
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
	successRedirect:"/usuarios",
	failureRedirect:"/login"
}))

router.get('/logout', function(req, res){
    req.logout();
    res.redirect('/login');
  });


  router.get("/verOfertas",(req, res, next)=>{
	if(req.isAuthenticated()) return next()
	res.redirect('login')
}, (req, res)=>{

    
           pool.query('SELECT preventa.* , usuarios.nombre FROM preventa INNER JOIN  usuarios ON preventa.usuario_ID = usuarios.id', (err, preventa)=>{

			
			console.log(preventa);
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
		res.redirect('login')
	}, (req, res)=>{

		const id=req.params.id;
	   
		pool.query('SELECT * FROM usuarios WHERE id= ?',[id],(err,usuarios)=>{
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
console.log(id);
pool.query('DELETE FROM preventa WHERE id= ?',[id],(err,usuarios)=>{
res.redirect('/')

})
							})







	 
 
	 router.post('/crearOferta',  (req, res)=>{

		const datosOferta = req.body;
		console.log(datosOferta);
	  pool.query('INSERT INTO preventa set ?', [datosOferta],(err,preventa)=>{
		  		console.log(preventa);
				res.redirect('/')
		  })
	  
	  }) 
	  
  
	  router.get("/ofertasRegistradas",(req, res, next)=>{
		if(req.isAuthenticated()) return next()
		res.redirect('login')
	}, (req,res)=>{
	
		
		pool.query('SELECT * FROM preventa WHERE usuario_ID= ?',[idLogin], (err, preventa)=>{
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
	}, (req, res)=>{

		const id=req.params.id;
		console.log("aca el id de detalles");
		console.log(id);
	   
		pool.query('SELECT * FROM preventa WHERE id= ?',id,(err,preventa)=>{
			console.log(preventa);
			if(err)console.log(err);
			res.render('detalles',{
				
				dato:preventa
			})
		})
	})
			  
passport.use(new PassportLocal(function(username, password, done){
	//			
	
var nombre =username
var clave = password
	pool.query('SELECT * FROM usuarios WHERE nombre= ?',[nombre],(err,usuarios)=>{
		
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