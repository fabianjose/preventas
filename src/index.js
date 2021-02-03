const express = require('express');
var cors = require('cors');
var morgan = require('morgan');
var bodyParser = require('body-parser');
const path = require('path')
const passport = require("passport")
const cookieParser = require("cookie-parser")
const session = require("express-session")
const PassportLocal = require("passport-local").Strategy;
const mysql = require('mysql')
const myConecction = require('express-myconnection')

const route = require('./Routes/index.js');

const app = express();

//CONEXION A BDD
app.use(myConecction(mysql,{
    host:'localhost',
    user: 'root',
    password: '',
    port: 3306,
    database:'crm'
}, 'single'))

app.use(cors());
app.use(morgan('tiny'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//motor de vistas

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))



app.listen(process.env.PORT || 3000, function() {
	console.log('Express app running on port ' + (process.env.PORT || 3000))
});

//configuracion de login

app.use(cookieParser('secret')) //ESTA #$%#$ VA PRIMERO
app.use(session({
	secret:'secreto',
	resave:true,
	saveUninitialized:true

}));


app.use(passport.initialize()) //ESTA #$%#$ VA SEGUNDO
app.use(passport.session()) //ESTA #$%#$ VA TERCERO


app.use('/', route);














