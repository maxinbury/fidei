const express = require('express')
const morgan = require('morgan')
const exphbs = require('express-handlebars')
const path = require('path')
const flash = require ('connect-flash')
const session = require('express-session')
const MySQLStore = require('express-mysql-session')
const {database} = require('./keys')
const passport = require('passport')

//inicializacion
const app = express()
require('./lib/passport')

//settings

app.set('port', process.env.PORT || 4000)
app.set('views', path.join(__dirname,'views'))
app.engine('.hbs', exphbs.engine({
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
app.use(express.urlencoded({extended:false}))
app.use(express.json())
app.use(passport.initialize())
app.use(passport.session())


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


//public  
app.use(express.static(path.join(__dirname, 'public') ))

//start 
app.listen(app.get('port'), ()=>{
    console.log(`server onport`, app.get('port'))
})

