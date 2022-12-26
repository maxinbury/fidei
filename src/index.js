const express = require('express')
const morgan = require('morgan')
const exphbs = require('express-handlebars')
const path = require('path')
const flash = require ('connect-flash')
const session = require('express-session')
const MySQLStore = require('express-mysql-session')
const {database} = require('./keys')
const passport = require('passport')
const cors = require("cors");
const jwt = require('jsonwebtoken')
const keys = require('./keys')
////




//inicializacion
const app = express()
require('./lib/passport')
app.set('key',keys.key)

//settings

app.set('port', process.env.PORT || 4000)
app.set('views', path.join(__dirname,'views')) // indica donde esta la carpeta views 
app.engine('.hbs', exphbs.engine({  // define la localizacion de los laouts nav y footers
    defaultLayout:'main',
    layoutDir: path.join(app.get('views'), 'layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
    extname:'.hbs',
    helpers: require('./lib/handlebars')
}))

app.set('view engine', '.hbs')


//middlwares
app.use(session({
    secret: 'faztmysqlnodesession',
    resave: false,
    saveUninitialized: false,
    store: new MySQLStore(database)
}))

app.use(flash())
app.use(morgan('dev'))
app.use(express.urlencoded({extended:false})) // para recibir datos de formularios
app.use(express.json())
app.use(passport.initialize())
app.use(passport.session())
app.use(cors());



//globalvariables
app.use((req,res,next)=>{
    app.locals.success = req.flash('success')
    app.locals.success = req.flash('message')
    app.locals.user = req.user
    next();
})


//routes
app.use(require('./routes/index'))
app.use(require('./routes/authentication'))
app.use(`/links`, require('./routes/links'))
app.use(`/cuotas`, require('./routes/cuotas'))
app.use('/pagos', require('./routes/pagos'))
app.use('/usuario1', require('./routes/usuario1'))
app.use('/aprobaciones', require('./routes/aprobaciones'))
app.use('/constancias', require('./routes/constancias'))
app.use('/lotes', require('./routes/lotes'))
app.use('/chats', require('./routes/chats'))
app.use('/nivel3', require('./routes/nivel3'))
app.use('/expedientes', require('./routes/expedientes'))
app.use('/relevamiento', require('./routes/relevamiento'))
app.use('/notificaciones', require('./routes/notificaciones'))
app.use('/administracion', require('./routes/Administracion'))
app.use('/home', require('./routes/home'))
app.use('/esme', require('./routes/esme'))


app.use(express.static(path.join(__dirname,'../pdfs')))
app.use(express.static(path.join(__dirname,'pdfs')))
//public  
app.use(express.static(path.join(__dirname, 'public') ))

app.use(express.static(path.join(__dirname, 'dbimages') ))


//start 
app.listen(app.get('port'), ()=>{
    console.log(`server onport`, app.get('port'))
})

