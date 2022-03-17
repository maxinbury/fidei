const passport = require('passport')
const LocalStrategy =require('passport-local').Strategy
const pool = require('../database')
const helpers = require('../lib/helpers')


passport.use('local.signin', new LocalStrategy({
    usernameField: 'usuario',
    passwordField: 'password',
    passReqToCallback: 'true'

}, async (req, usuario, password, done)=>{
        console.log(req.body)
        const rows = await pool.query('SELECT * FROM users WHERE usuario = ?',[usuario])
       
        if (rows.length > 0){
            const user = rows[0]
            const validPassword = await helpers.matchPassword(password, user.password)
            if (validPassword) {
                done(null, user, req.flash('success','Welcome' + user.nombrecompleto))
            } else {
                done(null, false, req.flash('message','Pass incorrecta'))
            }       
            }else {
                return done (null, false, req.flash('message','EL nombre de usuario no existe'))


        }
}))



passport.use('local.signup', new LocalStrategy({
    usernameField: 'usuario',
    passwordField: 'password',
    passReqToCallback: 'true'
}, async (req, usuario, password, done) =>{
    const { nombrecompleto, nivel } = req.body
    const newUser = {
        password,
        usuario,
        
    }
    newUser.password = await helpers.encryptPassword(password)
    const result = await pool.query('INSERT INTO users  set ?', [newUser])
    newUser.id = result.insertId//
    return done(null, newUser)//
}
))


passport.serializeUser((user, done)=> {
    done(null, user.id)
 })

 passport.deserializeUser(async (id, done)=>{
    const rows =  await pool.query('SELECT * FROM users Where id = ?', [id])
        done(null, rows[0])
}) 





