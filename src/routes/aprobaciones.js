const express = require('express')
const router = express.Router()
const pool = require('../database')
const { isLoggedIn,isLoggedInn2 } = require('../lib/auth') //proteger profile

const {pendientes,aprobar, rechazar2, rechazarcomp,pendientestodas, rechazo, aprobacioncbu, aprobarcbu,rechazarcbu, rechazobu, postrechazocbu } = require('../controladores/aprobacionesControlador')





// Lista de aprobaciones pendientes de contancias 
router.get('/pendientestodas',isLoggedInn2,pendientestodas)
///Aprobacion de constancia
router.get('/aprobar/:id',isLoggedInn2, aprobar)
/// Rechazo de constancia
router.post('/rechazarr/', rechazar2)


////Aprobacion de CBU
router.get('/aprobarcbu/:id',isLoggedInn2, aprobarcbu)
////Rechazar CBU
router.post('/rechazarcbu/',isLoggedInn2, rechazarcbu)

// LISTA DE CONSTANCIASY CBUS PENDIENTES
router.get('/',pendientes)

/

////RECHAZO DE COMPROBANTE 
router.get('/rechazarcomp/:id', isLoggedIn, rechazarcomp

)
///ACCION RECHAZO DE CONSTANCIAS
router.post("/rechazo", isLoggedIn, rechazo)




//LISTA DE ACCIONES DESDE PAGINAS HTML

router.get('/cbu', isLoggedIn,  aprobacioncbu)

// RECHAZO DE CBU PAGINA DE RELLENO 
router.get('/rechazarcbu/:id', isLoggedIn, rechazobu)

// RECHAZO DE CBU ACCION Y REDIRECCION

router.post("/rechazocbu", isLoggedIn, postrechazocbu)






//   ver***
router.get('/solicitaraprobacion', isLoggedIn,  async (req, res) => {
    const pendientes = await pool.query("Select * from cbus where estado = 'P'")
    res.render('aprobaciones/aprobacionescbu', { pendientes })

})






module.exports = router
