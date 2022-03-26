const express = require ('express')
const router = express.Router()
const pool = require('../database')
const {isLoggedIn} = require('../lib/auth') //proteger profile

router.get('/',isLoggedIn, (req, res) => {
    res.render('usuario1/menu')

} )

router.get("/cuotas", async (req,res)=> {

    const cuotas = await pool.query('SELECT * FROM cuotas WHERE dni = ?',[req.user.dni])
    console.log(cuotas)
    res.render('usuario1/listac', {cuotas})

})






module.exports= router

