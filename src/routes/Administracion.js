const express = require('express')
const router = express.Router()
const pool = require('../database')
const { isLoggedIn,isLoggedInn2 } = require('../lib/auth') //proteger profile
const { isLevel2 } = require('../lib/authnivel2')
const {pendientes,aprobar, aprobarcomp,rechazar2, rechazarcomp,pendientestodas, rechazo, aprobacioncbu, aprobarcbu,rechazarcbu, rechazobu, postrechazocbu } = require('../contoladores/controladoraprobaciones')





// LISTA TODAS PENDIENTES PAra React
//   ver***
router.get('/borrar/:cuil_cuit', isLoggedInn2,  async (req, res) => {
    const { cuil_cuit } = req.params

    await pool.query('DELETE FROM clientes WHERE cuil_cuit = ?', [cuil_cuit])
   res.send('borrado')

})




module.exports = router
