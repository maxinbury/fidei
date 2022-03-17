const express = require ('express')
const res = require('express/lib/response')
const router = express.Router()
const passport= require('passport')
const {isLoggedIn, isNotLoggedIn} = require('../lib/auth') //proteger profile

router.get('/signup', isNotLoggedIn,(req,res)=>{
    res.render('auth/signup')
})

router.post('/signup', isNotLoggedIn,passport.authenticate('local.signup', {
    successRedirect: '/profile',
    failureRedirect:'/signup',
    failureFlash:true

}))


//router.post('/signup', passport.authenticate('localsignup',))
router.get('/signin',isNotLoggedIn,(req,res) => {
    res.render('auth/signin')
}) 

router.post('/signin',isLoggedIn, (req, res, next) =>{
    passport.authenticate('local.signin',{
        successRedirect: '/profile',
        failureRedirect:'/signin',
        failureFlash:true
    })(req, res, next)
   
})

router.get('/profile', isLoggedIn, (req, res)=>{
    res.render('profile')
})
router.get('/logout', isLoggedIn,(req,res) =>{
    req.logout()
    res.redirect('/signin')
})


module.exports= router

