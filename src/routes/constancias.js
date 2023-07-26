const express = require('express')
const router = express.Router()
const pool = require('../database')
const { isLoggedIn } = require('../lib/auth') //proteger profile
const { lista, aprobadas, solicitaraprobacion, pendientes, rechazadas }=require('../controladores/constanciasControlador')



// LISTA DE CONSTANCIAS (TODAS)

router.get("/lista/:cuil_cuit", isLoggedIn, lista)


// LISTA DE CONSTANCIAS APROBADAS
router.get("/aprobadas/:cuil_cuit", isLoggedIn, aprobadas)

// solicitar 
router.get("/solicitaraprobacion/:cuil_cuit", isLoggedIn, solicitaraprobacion)



// LISTA DE CONSTANCIAS PENDIENTES
router.get("/pendientes/:cuil_cuit", isLoggedIn, pendientes)


// LISTA DE CONSTANCIAS RECHAZADAS
router.get("/rechazadas/:cuil_cuit", isLoggedIn, rechazadas)

module.exports = router