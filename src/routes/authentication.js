const express = require ('express')
const res = require('express/lib/response')
const router = express.Router()
const passport= require('passport')
const {isLoggedIn, isNotLoggedIn} = require('../lib/auth') //proteger profile
const isClient = require('../lib/authusuario')
const pool = require('../database')


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




/*
router.get('/profile', isLoggedIn, isClient, (req, res)=> {
    res.send(console.log('cliente'))
}) 
*/

//sORIGINAL
router.get('/profile', isLoggedIn, (req, res)=>{

    res.render('profile')}) 




/*
router.get('/profile', isLoggedIn, async (req, res)=>{
        const nivel = await pool.query('SELECT nivel FROM users WHERE nivel = ? '[req.user.nivel]) //[req.user.id]
        console.log(links)
    switch (isClient){
        case 1 : res.send(console.log('cliente'))

        default: res.render('profile')


    }

}) */

/* router.get("/",isLoggedIn,  async (req,res)=> {
    const links = await pool.query('SELECT * FROM clientes') //[req.user.id]
    console.log(links)
    res.render('links/list', {links}) */



router.get('/logout', isLoggedIn,(req,res) =>{
    req.logout()
    res.redirect('/signin')
})


module.exports= router
