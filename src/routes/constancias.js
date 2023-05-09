const express = require('express')
const router = express.Router()
const pool = require('../database')
const { isLoggedIn } = require('../lib/auth') //proteger profile
const { isLevel2 } = require('../lib/authnivel2')
const { lista, aprobadas, solicitaraprobacion, pendientes, rechazadas }=require('../controladores/constanciasControlador')



// LISTA DE CONSTANCIAS (TODAS)

router.get("/lista/:cuil_cuit", isLoggedIn,isLevel2, lista)


// LISTA DE CONSTANCIAS APROBADAS
router.get("/aprobadas/:cuil_cuit", isLoggedIn,isLevel2, aprobadas)

// solicitar 
router.get("/solicitaraprobacion/:cuil_cuit", isLoggedIn,isLevel2, solicitaraprobacion)



// LISTA DE CONSTANCIAS PENDIENTES
router.get("/pendientes/:cuil_cuit", isLoggedIn,isLevel2, pendientes)


// LISTA DE CONSTANCIAS RECHAZADAS
router.get("/rechazadas/:cuil_cuit", isLoggedIn,isLevel2, rechazadas)

module.exports = router