const express = require ('express')
const res = require('express/lib/response')
const router = express.Router()
const passport= require('passport')
const {isLoggedIn, isNotLoggedIn} = require('../lib/auth') //proteger profile
//const isClient = require('../lib/authusuario') ----->>>>  Para Rol 
const pool = require('../database')
const {isLevel2} = require('../lib/authnivel2') 


router.get('/signup', isNotLoggedIn,(req,res)=>{
    res.render('auth/signup')
})



router.post('/signup', isNotLoggedIn,passport.authenticate('local.signup', {
    successRedirect: '/signin',
    failureRedirect:'/signup',
    failureFlash:true

}))


//router.post('/signup', passport.authenticate('localsignup',))
router.get('/signin',isNotLoggedIn,(req,res) => {
    res.render('auth/signin')

}) 




router.post('/signin', (req, res, next) =>{
    passport.authenticate('local.signin',{
        successRedirect: '/profile',
        failureRedirect:'/signin',
        failureFlash:true
    })(req, res, next)
   
})





//sORIGINAL
router.get('/profile', isLoggedIn,isLevel2, async (req, res)=>{
    if(req.user.nivel==2){
    const pagos_p = await pool.query(" Select * from pagos where estado = 'P' ")
    const constancias_p = await pool.query(" Select * from constancias where estado = 'P' ")
    const cbus = await pool.query(" Select * from cbus where estado = 'P' ")
    const chats = await pool.query(" Select * from chats where leido = 'NO' ")
    
    res.render('profile',{pagos_p, constancias_p, cbus, chats})}
    else{
        res.render('nivel3/profile')
    }
}
) 





router.get('/logout', isLoggedIn,(req,res) =>{
    req.logout()
    res.redirect('/signin')
})








//  ACCIONES NIVEL 3

router.post('/agregarunusuario',passport.authenticate('local.signupnivel3', {
    successRedirect: '/signin',
    failureRedirect:'/signup',
    failureFlash:true

}))



module.exports= router
