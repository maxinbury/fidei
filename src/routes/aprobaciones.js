const express = require('express')
const router = express.Router()
const pool = require('../database')
const { isLoggedIn } = require('../lib/auth') //proteger profile
const { isLevel2 } = require('../lib/authnivel2')
const {pendientes,aprobar, aprobarcomp,rechazar2, rechazarcomp,pendientestodas, rechazo, aprobacioncbu, aprobarcbu,rechazarcbu, rechazobu, postrechazocbu } = require('../contoladores/controladoraprobaciones')


// LISTA TODAS PENDIENTES PAra React
router.get('/pendientestodas',pendientestodas)

router.get('/aprobar/:id', aprobar)
router.get('/aprobarcbu/:id', aprobarcbu)

router.post('/rechazarr/', rechazar2)

//

router.post('/rechazarcbu/', rechazarcbu)



// LISTA DE CONSTANCIAS PENDIENTS

router.get('/',pendientes)

// APROBACION DE CONSTANCIA

router.get('/aprobarcomp/:id', isLoggedIn, aprobarcomp)


////RECHAZO DE COMPROBANTE PAGINA DE RELLENO
router.get('/rechazarcomp/:id', isLoggedIn, rechazarcomp

)
///ACCION RECHAZO DE CONSTANCIAS

router.post("/rechazo", isLoggedIn, rechazo)


//-------FIN CONSTANCIAS 


//-----INICIO CBUS 


//LISTA DE CBUS PENDIENTES

router.get('/cbu', isLoggedIn, isLevel2, aprobacioncbu)


// APROBACION DE CBU Y ACTUALIZACION DE LA MISMA PAGINA 

router.get('/aprobarcbu/:id', isLoggedIn, aprobarcbu)



// RECHAZO DE CBU PAGINA DE RELLENO 
router.get('/rechazarcbu/:id', isLoggedIn, rechazobu)

// RECHAZO DE CBU ACCION Y REDIRECCION

router.post("/rechazocbu", isLoggedIn, postrechazocbu)






//   ver***
router.get('/solicitaraprobacion', isLoggedIn, isLevel2, async (req, res) => {
    const pendientes = await pool.query("Select * from cbus where estado = 'P'")
    res.render('aprobaciones/aprobacionescbu', { pendientes })

})






module.exports = router
