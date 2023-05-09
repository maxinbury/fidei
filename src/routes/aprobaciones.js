const express = require('express')
const router = express.Router()
const pool = require('../database')
const { isLoggedIn,isLoggedInn2 } = require('../lib/auth') //proteger profile
const { isLevel2 } = require('../lib/authnivel2')
const {pendientes,aprobar, rechazar2, rechazarcomp,pendientestodas, rechazo, aprobacioncbu, aprobarcbu,rechazarcbu, rechazobu, postrechazocbu } = require('../controladores/aprobacionesControlador')





// LISTA TODAS PENDIENTES PAra React
router.get('/pendientestodas',isLoggedInn2,pendientestodas)

router.get('/aprobar/:id',isLoggedInn2, aprobar)
router.get('/aprobarcbu/:id',isLoggedInn2, aprobarcbu)

router.post('/rechazarr/', rechazar2)

//

router.post('/rechazarcbu/',isLoggedInn2, rechazarcbu)



// LISTA DE CONSTANCIAS PENDIENTS

router.get('/',pendientes)

/

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
