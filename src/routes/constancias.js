const express = require('express')
const router = express.Router()
const pool = require('../database')
const { isLoggedIn } = require('../lib/auth') //proteger profile
const { lista,  solicitaraprobacion }=require('../controladores/constanciasControlador')



// LISTA DE CONSTANCIAS (TODAS)

router.get("/lista/:cuil_cuit", isLoggedIn, lista)




// solicitar 
router.get("/solicitaraprobacion/:cuil_cuit", isLoggedIn, solicitaraprobacion)







module.exports = router