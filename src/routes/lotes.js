const express = require('express')
const router = express.Router()
const pool = require('../database')
const { isLoggedInn2, isLoggedInn} = require('../lib/auth') //proteger profile
const XLSX = require('xlsx')
const { loteCliente, loteCliente2, listadeTodos, listadeLotes, nuevolote, lista2, traerlotesleg } = require('../controladores/lotesControlador')




router.get('/lotescliente/:cuil_cuit', isLoggedInn2, loteCliente)


router.post('/desasignarlote/:id',isLoggedInn2, )


///////

router.get('/lotescliente2/:cuil_cuit',isLoggedInn2, loteCliente2)


//////


//LISTA DE LOTES 
router.get('/listadetodos',isLoggedInn2, listadeTodos)

///lista de legales
router.get('/lista2',isLoggedInn2,lista2)




//filtro solo lotes
router.get('/listadelotes', isLoggedInn2,listadeLotes )

router.post('/nuevolote', isLoggedInn,nuevolote )



router.get('/traerlotesleg', isLoggedInn2,traerlotesleg )



router.get('/desasignarlote', isLoggedInn2, )


module.exports = router


