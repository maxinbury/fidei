const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const pool = require('../database')
const helpers = require('../lib/helpers')
const jwt = require('jsonwebtoken')


passport.use('local.signin', new LocalStrategy({
    usernameField: 'cuil_cuit', // usuario es el nombre que recibe del hbs
    passwordField: 'password',
    passReqToCallback: 'true' // para recibir mas datos 

}, async (req, cuil_cuit, password, done) => {  // que es lo que va a hacer 

    const rows = await pool.query('SELECT * FROM users WHERE cuil_cuit = ?', [cuil_cuit])

    if (rows.length > 0) {
        const user = rows[0]

        const validPassword = await helpers.matchPassword(password, user.password)
        console.log(user)
        if (validPassword) {

            /*  const userFoRToken = {
                   id: user.id,
                   cuil_cuit: user.cuil_cuit,
                   nivel: user.nivel
               }
               const token = jwt.sign(userFoRToken, 'fideicomisocs121', { expiresIn: 60 * 60 * 24 * 7 })
               res.send({ id: req.user.id,cuil_cuit: req.user.cuil_cuit,token, nivel: req.user.nivel}) */
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

    const { nombre, email, telefono, nro_cliente } = req.body

    //  const razon = await pool.query('Select razon from clientes where cuil_cuit like  ?', [cuil_cuit]) seleccionar razon

    const nivel = 1
    console.log('cuil_cuit')
    const habilitado = 'NO'



    // transformar 







    //fin transformar 
    try {
        var rows = await pool.query('SELECT * FROM users WHERE cuil_cuit like  ?', [cuil_cuit]) // falta restringir si un usuario se puede registrar sin ser cliente

        let aux = cuil_cuit

        aux = '%' + cuil_cuit + '%'
        if (rows.length == 0) { // si ya hay un USER con ese dni 

            rows = await pool.query('SELECT * FROM clientes WHERE cuil_cuit like ?', [aux])
            if (rows.length == 0) { // so hay  un cliente con ese dni 
                { done(null, false, 'error,algo sucedio ') }
            } else {
                const razon = rows[0]['razon']
                const newUser = {
                    password,
                    cuil_cuit,
                    nombre,
                    nivel,
                    razon,
                    telefono,
                    mail:email,
                    habilitado,
                    nro_cliente
                }
                try {

                    rows = await pool.query('SELECT * FROM clientes WHERE id = ?  and cuil_cuit like ?', [nro_cliente, aux])

                    if (rows.length == 0) {
                        done(null, false, req.flash('message', 'error,algo sucedio '))

                    } else {

                        newUser.password = await helpers.encryptPassword(password)
                        try {
                            
                            actumail = {
                                email
                            }
                            await pool.query('UPDATE clientes set ? WHERE cuil_cuit = ?', [actumail, cuil_cuit])
                        } catch (error) {
                            console.log(error)
                        }

                        try {
                            const result = await pool.query('INSERT INTO users  set ?', [newUser])
                            newUser.id = result.insertId// porque newuser no tiene el id
                            return done(null, newUser)// para continuar, y devuelve el newUser para que almacene en una sesion

                        } catch (error) {
                            console.log(error)
                        }
                    }
                } catch (error) {
                    console.log(error)
                    req.flash('message', 'error,algo sucedio ')
                    // req.flash('message', 'error,algo sucedio ')

                }
            }



        } else {
            done(null) // false para no avanzar

        }
    } catch (error) {
        console.log(error)
        req.flash('message', 'error,algo sucedio ')


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




passport.use('local.signupnivel3', new LocalStrategy({
    usernameField: 'cuil_cuit',
    passwordField: 'password',
    passReqToCallback: 'true'
}, async (req, cuil_cuit, password, done) => {

    const { nombre, mail, nivel } = req.body
    //  const razon = await pool.query('Select razon from clientes where cuil_cuit like  ?', [cuil_cuit]) seleccionar razon


    const habilitado = 'NO'
    const newUser = {
        password,
        cuil_cuit,
        nombre,
        nivel,
        mail,


    }


    //fin transformar 
    try {
        var rows = await pool.query('SELECT * FROM users WHERE cuil_cuit like  ?', [cuil_cuit]) // falta restringir si un usuario se puede registrar sin ser cliente
        if (rows.length == 0) { // si ya hay un USER con ese dni 

            newUser.password = await helpers.encryptPassword(password)
            try {
                const result = await pool.query('INSERT INTO users  set ?', [newUser])
                newUser.id = result.insertId// porque newuser no tiene el id

                return done(null, newUser)// para continuar, y devuelve el newUser para que almacene en una sesion

            } catch (error) {
                console.log(error)
            }
        }

        else {
            console.log('error, ese cuit ya tiene un usuairo existente')
            done(null, false, req.flash('message', 'error, ese cuit ya tiene un usuairo existente  ')) // false para no avanzar

        }
    } catch (error) {
        console.log(error)
        req.flash('message', 'error,algo sucedio ')


    }
}


))



/// Recupero de contraseña 

passport.use('local.recupero', new LocalStrategy({
    usernameField: 'cuil_cuit',
    passwordField: 'password',
    passReqToCallback: 'true'
}, async (req, cuil_cuit, password,done) => {

    const { codigo } = req.body
    //  const razon = await pool.query('Select razon from clientes where cuil_cuit like  ?', [cuil_cuit]) seleccionar razon

    console.log('llega')

    const newUser = {
        password,
      
        
        

    }

    try {
        let rows = await pool.query('SELECT * FROM users WHERE cuil_cuit like  ?', [cuil_cuit]) // falta restringir si un usuario se puede registrar sin ser cliente
        console.log(rows[0]['recupero'])
        console.log(codigo)
        if (rows[0]['recupero'] === codigo) { // si ya hay un USER con ese dni 
            console.log('codigo validado')
            newUser.password = await helpers.encryptPassword(password)
            try {
               
                await pool.query('UPDATE users set ? WHERE cuil_cuit like  ?', [newUser,cuil_cuit])
               // newUser.id = result.insertId// porque newuser no tiene el id
              
                return ('actualizado')// para continuar, y devuelve el newUser para que almacene en una sesion

            } catch (error) {
                console.log(error)
            }
        }

        else {
            console.log('error, codigo mal')
            done(null, false, req.flash('message', 'error, ese cuit ya tiene un usuairo existente  ')) // false para no avanzar

        }
    } catch (error) {
        console.log(error)
        req.flash('message', 'error,algo sucedio ')


    }
}


))