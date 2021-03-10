

const controller = {}


controller.login =  (req, res, next)=>{
	console.log(req.isAuthenticated());
	if(req.isAuthenticated()) return next()
	res.redirect('login')
}, (req,res)=>{
    	res.render('/perfil')
}




controller.dashboard = (req,res,next) =>{
	console.log("hola")
}


module.exports= controller;                  