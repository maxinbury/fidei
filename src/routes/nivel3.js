const express = require('express')
const router = express.Router()
const pool = require('../database')

const { isLevel3 } = require('../lib/authnivel3')
const { isLoggedIn } = require('../lib/auth') //proteger profile
const XLSX = require('xlsx')



/*
//PERFIL USUARIO NIVEL 3
router.get('/profile', isLoggedIn, isLevel2, (req, res) => {

    res.render('links/add')

})
*/

//ACCESO A MENU DE USUARIO NIVEL 2
router.get('/perfilnivel2', isLoggedIn, isLevel3, async (req, res) => {

    const pagos_p = await pool.query(" Select * from pagos where estado = 'P' ")
    const constancias_p = await pool.query(" Select * from constancias where estado = 'P' ")
    const cbus = await pool.query(" Select * from cbus where estado = 'P' ")
    const chats = await pool.query(" Select * from chats where leido = 'NO' ")

res.render('profile',{pagos_p, constancias_p, cbus, chats})}

)

// AGREGAR USUARIO 

router.get('/agregarusuario', isLoggedIn, isLevel3, (req, res) => {

    res.render('nivel3/agregarusuario')

})

router.post('/agregarunusuario', async (req, res,) => {
    const { cuil_cuit, nombre, mail, nivel } = req.body;
 
const nuevo={
    cuil_cuit,
     nombre,
      mail,
       nivel 
}
  console.log(nuevo)



})




module.exports = router
