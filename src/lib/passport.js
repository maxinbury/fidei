const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const pool = require('../database')
const helpers = require('../lib/helpers')


passport.use('local.signin', new LocalStrategy({
    usernameField: 'cuil_cuit', // usuario es el nombre que recibe del hbs
    passwordField: 'password',
    passReqToCallback: 'true' // para recibir mas datos 

}, async (req, cuil_cuit, password, done) => {  // que es lo que va a hacer 
   
    const rows = await pool.query('SELECT * FROM users WHERE cuil_cuit = ?', [cuil_cuit])
    if (rows.length > 0) {
        const user = rows[0]
        const validPassword = await helpers.matchPassword(password, user.password)
        if (validPassword) {
            done(null, user, req.flash('success', 'Welcome' + user.nombrecompleto)) // done termina, null el error, user lo pasa para serializar
        } else {
            done(null, false, req.flash('message', 'Pass incorrecta')) // false para no avanzar
        }
    } else {
        return done(null, false, req.flash('message', 'EL nombre de cuil/cuit no existe'))
    }
}))


passport.use('local.signup', new LocalStrategy({
    usernameField: 'cuil_cuit',
    passwordField: 'password',
    passReqToCallback: 'true'
}, async (req, cuil_cuit, password, done) => {
    
    const { nombre, mail, telefono, nro_cliente } = req.body
    const razon = await pool.query('Select razon from clientes where cuil_cuit like  %?% ', [cuil_cuit])
    console.log(mail)
    const nivel = 1
    const habilitado ='NO'
    const newUser = {
        password,
        cuil_cuit,
        nombre,
        nivel,
        razon,
        telefono,
        mail,
        habilitado,
        //nro_cliente
    }

     // transformar 
     
      
        cuil_cuit =  (cuil_cuit).slice(0, 2) + "-" + (cuil_cuit).slice(2);
        console.log(cuil_cuit)
        cuil_cuit =  (cuil_cuit).slice(0, 11) + "-" + (cuil_cuit).slice(11);
         console.log(cuil_cuit)
       
       
   
     //fin transformar 

    var rows = await pool.query('SELECT * FROM users WHERE cuil_cuit = ?', [cuil_cuit]) // falta restringir si un usuario se puede registrar sin ser cliente
    if (rows.length == 0) {
            rows = await pool.query('SELECT * FROM clientes WHERE cuil_cuit = ?', [cuil_cuit])
            if (rows.length == 0) {
                { done(null, false, req.flash('message', 'error, no hay ningun cliente con ese documento  ')) }
            } else {
                newUser.password = await helpers.encryptPassword(password)
                try {
                    const result = await pool.query('INSERT INTO users  set ?', [newUser])
                    newUser.id = result.insertId// porque newuser no tiene el id
                    return done(null, newUser)// para continuar, y devuelve el newUser para que almacene en una sesion
                    
                } catch (error) {
                    console.log(error)
                }
              
            }
    } else {
        done(null, false, req.flash('message', 'error, cuil/cuit ya existente ')) // false para no avanzar
    }
}


))
passport.serializeUser((user, done) => {
    done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
    const rows = await pool.query('SELECT * FROM users Where id = ?', [id])
    done(null, rows[0])
})





