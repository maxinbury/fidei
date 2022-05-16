const express = require('express')
const router = express.Router()
const pool = require('../database')
const { isLevel2 } = require('../lib/authnivel2')
const { isLevel3 } = require('../lib/authnivel3')
const { isLoggedIn } = require('../lib/auth') //proteger profile
const XLSX = require('xlsx')





router.get('/profile', isLoggedIn, isLevel2, (req, res) => {

    res.render('links/add')

})
router.get('/perfilnivel2', isLoggedIn, isLevel2, async (req, res) => {

    const pagos_p = await pool.query(" Select * from pagos where estado = 'P' ")
    const constancias_p = await pool.query(" Select * from constancias where estado = 'P' ")
    const cbus = await pool.query(" Select * from cbus where estado = 'P' ")
    const chats = await pool.query(" Select * from chats where leido = 'NO' ")

res.render('profile',{pagos_p, constancias_p, cbus, chats})}

  

)





module.exports = router
