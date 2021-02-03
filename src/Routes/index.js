const express = require('express');
const PassportLocal = require("passport-local").Strategy;
const cookieParser = require("cookie-parser")
const session = require("express-session")



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

    req.getConnection((err, conn)=>{
            conn.query('SELECT * FROM usuarios', (err, usuarios)=>{
                if(err){
                    res.json(err);                    
                }

                console.log(usuarios);
                res.render('usuarios',{
                    data:usuarios
                })
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
req.getConnection((err,conn)=>{
conn.query('INSERT INTO usuarios set ?', [datos],(err,usuarioss)=>{
		  res.redirect('usuarios')
		  console.log(usuarioss);
    })})})  






	router.get('/update/:id',(req, res, next)=>{
		console.log(req.isAuthenticated());
		if(req.isAuthenticated()) return next()
		res.redirect('login')
	}, (req, res)=>{

		const id=req.params.id;
	   
	req.getConnection((err, conn)=>{
		conn.query('SELECT * FROM usuarios WHERE id= ?',[id],(err,usuarios)=>{
			console.log(usuarios);
			res.render('editUsuario',{
				
				data:usuarios[0]
			})
		})
	})
	
	})
	
	router.post ('/update/:id', (req, res)=>{
	
		const id=req.params.id;		
		const nuevoUsuario = req.body;
		console.log(nuevoUsuario);
	req.getConnection((err, conn)=>{
		console.log("conexion abierta 1");
		
		conn.query('UPDATE usuarios set ? WHERE id= ? ',[nuevoUsuario,id],(err,rows)=>{
			if(err){
				console.log(err);
			}
			console.log("conexion abierta 2");
			console.log(rows);
			console.log("conexion abierta 3 despues de mostrar filas de BD");
			console.log("conexion abierta 4 Mandando a renderizar");

			res.redirect('/usuarios')
			})
		})	
	})
	

router.get( '/delete/:id',  (req, res)=>{
const id=req.params.id;



req.getConnection((err, conn)=>{
conn.query('DELETE FROM usuarios WHERE id= ?',[id],(err,usuarios)=>{
res.redirect('/usuarios')
})
})
						  })



passport.use(new PassportLocal(function(username, password, done){

	//			conn.query('SELECT * FROM usuarios WHERE nombre= ? WHERE password= ?  ',[nombre, clave ],(err,rows)=>{

	
	
	if(username=="fabian" && password == "1") 
	return done(null, {id:1, name:"jose"})

	done(null, false, )
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