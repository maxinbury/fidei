const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const pool = require('../database')
const helpers = require('../lib/helpers')

///Registro nivel 3: desconectado 
passport.use('local.signup', new LocalStrategy({
    usernameField: 'cuil_cuit',
    passwordField: 'password',
    passReqToCallback: 'true'
}, async (req, cuil_cuit, password, done) => {

    const { nombre, mail, telefono, nro_cliente } = req.body
    //  const razon = await pool.query('Select razon from clientes where cuil_cuit like  ?', [cuil_cuit]) seleccionar razon

    const nivel = 1
    const habilitado = 'NO'
    const newUser = {
        password,
        cuil_cuit,
        nombre,
        nivel,

        telefono,
        mail,
        habilitado,
        nro_cliente
    }

    // transformar 
    let aux = cuil_cuit 
    
      cuil_cuit =  (cuil_cuit).slice(0, 2) + "-" + (cuil_cuit).slice(2);
    
      cuil_cuit =  (cuil_cuit).slice(0, 11) + "-" + (cuil_cuit).slice(11);
    
    
       aux = '%' + cuil_cuit + '%'

    //fin transformar 
    try {
        var rows = await pool.query('SELECT * FROM users WHERE cuil_cuit like  ?', [aux]) // falta restringir si un usuario se puede registrar sin ser cliente
        if (rows.length == 0) { // si ya hay un USER con ese dni 
            rows = await pool.query('SELECT * FROM clientes WHERE cuil_cuit like ?', [aux])
            if (rows.length == 0) { // so hay  un cliente con ese dni 
                { done(null, false, req.flash('message', 'error, no hay ningun cliente con ese documento  ')) }
            } else {
                try {

                    rows = await pool.query('SELECT * FROM clientes WHERE id = ? and cuil_cuit like ?', [nro_cliente, aux])
                    if (rows.length == 0) {
                        done(null, false, req.flash('message', 'error, el Numero de cliente no coincide')) 
                        
                    }else{
                    newUser.password = await helpers.encryptPassword(password)
                    try {
                        const result = await pool.query('INSERT INTO users  set ?', [newUser])
                        newUser.id = result.insertId// porque newuser no tiene el id
                        return done(null, newUser)// para continuar, y devuelve el newUser para que almacene en una sesion

                    } catch (error) {
                       // console.log(error)
                    }}
                } catch (error) {
                   // console.log(error)
                    req.flash('message', 'error,algo sucedio ')
                   
                }


            }
        } else {
            done(null, false, req.flash('message', 'error, ese cuit ya tiene un usuairo existente  ')) // false para no avanzar
           
        }
    } catch (error) {
        //console.log(error)
        req.flash('message', 'error,algo sucedio ')
        

    }
}


))