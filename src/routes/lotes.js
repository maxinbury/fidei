const express = require('express')
const router = express.Router()
const pool = require('../database')
const { isLoggedInn2} = require('../lib/auth') //proteger profile
const XLSX = require('xlsx')
const { loteCliente, loteCliente2, listadeTodos, listadeLotes } = require('../controladores/lotesControlador')




router.get('/lotescliente/:cuil_cuit', isLoggedInn2, loteCliente)


router.post('/calcularvalor',isLoggedInn2, )


///////

router.get('/lotescliente2/:cuil_cuit',isLoggedInn2, loteCliente2)


//////


//LISTA DE LOTES 
router.get('/listadetodos',isLoggedInn2, listadeTodos)



//filtro solo lotes
router.get('/listadelotes', isLoggedInn2,listadeLotes )






module.exports = router


