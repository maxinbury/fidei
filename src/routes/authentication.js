const express = require('express')
const res = require('express/lib/response')
const router = express.Router()
const passport = require('passport')
const { isLoggedIn, isLoggedInn, isLoggedInn2, isNotLoggedIn } = require('../lib/auth') //proteger profile
//const isClient = require('../lib/authusuario') ----->>>>  Para Rol 
const pool = require('../database')
const { isLevel2 } = require('../lib/authnivel2')
const jwt = require('jsonwebtoken')
const enviodemail = require('./Emails/Enviodemail')




router.post('/recuperoo', passport.authenticate('local.recupero', {
    successRedirect: '/exitorecupero',
    failureRedirect: '/noexito',
    failureFlash: true

}))

router.get('/exitorecupero', (req, res) => {
    console.log('Registrado')
    res.send('Contraseña actualizada')
})

router.post('/recupero', async (req, res) => {
    let { cuil_cuit } = req.body

console.log(cuil_cuit)
    const banco = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let recupero = "";

    const usuario = await pool.query('select * from users where cuil_cuit = ?', [cuil_cuit])
    if (usuario.length > 0) {
        const cliente = await pool.query('select * from clientes where cuil_cuit = ?', [cuil_cuit])
        for (let i = 0; i < 10; i++) {

            recupero += banco.charAt(Math.floor(Math.random() * banco.length));
        }

        console.log(recupero)
        actualizar = {
            recupero,
            intentos: 0
        }

        mensaje = 'El codigo es '+recupero
    
       msj = await enviodemail.enviarmail.enviarmailRecupero(cliente[0]['email'],'asunto','encabezado',mensaje)

        await pool.query('UPDATE users set ? WHERE cuil_cuit = ?', [actualizar, cuil_cuit])
        res.send(msj)
    }else {
        res.send('Usuario no existente o no registrado')
    }



    // enviodemail.enviarmail.enviarmailRecupero(cliente[0]['email'],'asunto','encabezado','mensaje')

})


router.post('/signup', passport.authenticate('local.signup', {

    successRedirect: '/signin',
    failureRedirect: '/signup',
    failureFlash: true

}))
router.post('/signupp', passport.authenticate('local.signup', {
    successRedirect: '/exitosignup',
    failureRedirect: '/noexito',
    failureFlash: true

}))

router.get('/traerusuario/:cuil_cuit',isLoggedInn, async (req, res) => {
    cuil_cuit = req.params.cuil_cuit
    const usuario = await pool.query('select * from users where cuil_cuit= ? ', [cuil_cuit])
    res.json(usuario)


})

router.get('/exitosignup', (req, res) => {
    console.log('Registrado')
    res.send('Registrado exitosamente!')
})

router.get('/noexito', (req, res) => {

    res.send('Sin Exito')
})

router.get('/noexitorecupero', (req, res) => {

    res.send('Error contraseña invalida')
})





//router.post('/signup', passport.authenticate('localsignup',))
router.get('/signin', isNotLoggedIn, (req, res) => {
    console.log(req.user)
    res.render('auth/signin')

})

/////////////jwt prueba
router.post('/signinn', passport.authenticate('local.signin', { failureRedirect: '/login' }),
    function (req, res) {
        console.log(req.user)
        const userFoRToken = {
            id: req.user.id,
            cuil_cuit: req.user.cuil_cuit,
            nivel: req.user.nivel,

        }

        const token = jwt.sign(userFoRToken, 'fideicomisocs121', { expiresIn: 60 * 60 * 24 * 7 })
        //const token = jwt.sign(userFoRToken, 'fideicomisocs121', { expiresIn:    1* 60})
     
        console.log(token)
        res.send({
            id: req.user.id,
            cuil_cuit: req.user.cuil_cuit,
            nivel: req.user.nivel,
            token,
            razon: req.user.razon,

        })
    }

);
/////////////////

router.post('/signin', (req, res, next) => {
    passport.authenticate('local.signin', {
        successRedirect: '/profile',
        failureRedirect: '/signin',
        failureFlash: true

    })(req, res, next)


})



//sORIGINAL
router.get('/profile', isLoggedIn, async (req, res) => {
    console.log(req.user)
    if (req.user.nivel == 2) {
        const pagos_p = await pool.query(" Select * from pagos where estado = 'P' ")
        const constancias_p = await pool.query(" Select * from constancias where estado = 'P' ")
        const cbus = await pool.query(" Select * from cbus where estado = 'P' ")
        const chats = await pool.query(" Select * from chats where leido = 'NO' ")

        res.render('profile', { pagos_p, constancias_p, cbus, chats })
    }
    else {
        if (req.user.nivel == 3) {
            res.render('nivel3/profile')
        } else {
            res.render('usuario1/menu')
        }
    }
}
)





router.get('/logout', isLoggedIn, (req, res) => {
    req.logout()
    res.redirect('/signin')
})








//  ACCIONES NIVEL 3

router.post('/agregarunusuario', passport.authenticate('local.signupnivel3', {
    successRedirect: '/signin',
    failureRedirect: '/signup',
    failureFlash: true

}))

//probando  json web token 
router.get('/loging', async (req, res) => {
    const { cuil_cuit, password } = req.body;

    const rows = await pool.query('SELECT * FROM users')
    console.log('pide')

    res.json(rows)


})

router.get('/prueba', isLoggedInn2, async (req, res) => {
    /*const { cuil_cuit, algo, token } = req.body;*/
    console.log('hola')

    rows = await pool.query('select * from clientes ')


    res.json(rows)





})

module.exports = router
