const express = require('express');
const PassportLocal = require("passport-local").Strategy;
const cookieParser = require("cookie-parser")
const session = require("express-session")
const myConecction = require('express-myconnection')
const pool = require('../database')




const passport = require("passport")

//const controlApp = require('../controller/index')

const model = require('../Models/index.js');




const router = express.Router();



router.get("/",(req, res, next)=>{
	console.log(req.isAuthenticated());
	if(req.isAuthenticated()) return next()
	res.redirect('login')
}, (req,res)=>{
    	res.render('perfil')
})



router.get("/usuarios",(req, res, next)=>{
	console.log(req.isAuthenticated());
	if(req.isAuthenticated()) return next()
	res.redirect('login')
}, (req, res)=>{

    
           pool.query('SELECT * FROM usuarios', (err, usuarios)=>{
                if(err){
                    res.json(err);                    
                }

                console.log(usuarios);
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




  router.post('/add',  (req, res)=>{

  const datos = req.body;
  console.log(req.body);
pool.query('INSERT INTO usuarios set ?', [datos],(err,usuarioss)=>{
		  res.redirect('usuarios')
		  console.log(usuarioss);
    })})  






	router.get('/update/:id',(req, res, next)=>{
		console.log(req.isAuthenticated());
		if(req.isAuthenticated()) return next()
		res.redirect('login')
	}, (req, res)=>{

		const id=req.params.id;
	   
		pool.query('SELECT * FROM usuarios WHERE id= ?',[id],(err,usuarios)=>{
			console.log(usuarios);
			res.render('editUsuario',{
				
				data:usuarios[0]
			})
		})
	})
	
	router.post ('/update/:id', (req, res)=>{
	
		const id=req.params.id;		
		const nuevoUsuario = req.body;
		console.log(nuevoUsuario);

	
		
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



			  
passport.use(new PassportLocal(function(username, password, done){
	//			
	
var nombre =username
var clave = password
	pool.query('SELECT * FROM usuarios WHERE nombre= ?',[nombre],(err,usuarios)=>{
		
			console.log("entre con nombre");
			console.log(usuarios.length);
			if(usuarios.length>0){
				console.log(usuarios[0]);
				if (usuarios[0].password==clave){
					console.log("comprobando clave");
					return done(null, {id:usuarios[0].id, name:usuarios[0].nombre})
				}
					done(null, false, )
			}


	
			
		})

	

}))


//serializar

passport.serializeUser(function(user, done){
	done(null, user.id)
})

//deserializar
passport.deserializeUser(function(id,done){
	done(null, {id:1 , name:"jose"})
})
module.exports = router;