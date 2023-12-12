const express = require('express')
const router = express.Router()
const pool = require('../database')
const { isLoggedInn2, isLoggedInn} = require('../lib/auth') //proteger profile
const XLSX = require('xlsx')
const { loteCliente, loteCliente2, listadeTodos, listadeLotes, nuevolote, lista2, traerlotesleg, nuevamanzana, traermanzanas, modificarlote } = require('../controladores/lotesControlador')




router.get('/lotescliente/:cuil_cuit', /* isLoggedInn2, */ loteCliente)


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

router.post('/nuevamanzana', isLoggedInn, nuevamanzana)

router.post('/nuevolote', isLoggedInn,nuevolote )

router.post('/modificarlote', isLoggedInn,modificarlote )



router.get('/traerlotesleg', isLoggedInn2,traerlotesleg )

router.get('/traermanzanas', isLoggedInn2,traermanzanas )

router.get('/desasignarlote', isLoggedInn2, )



router.post('/determinarmapa1', async (req, res) => {
    const { manzana, lote,mapa1 } = req.body
    console.log( manzana, lote,mapa1)
    const asignar = {mapa1}
    try {
        await pool.query('UPDATE lotes set ? WHERE zona ="IC3" and manzana=? and lote=?', [asignar,manzana, lote])
 
    } catch (error) {
        console.log(error)
        res.json('error ')
    }
    res.json('Actualizado')
})




router.post('/calcularvalor', async (req, res) => {
    const { zona, manzana, parcela, cuil_cuit,lote } = req.body
   console.log( zona, manzana, parcela, cuil_cuit,lote)

    if (zona==='PIT'){
        valormetro= await pool.query('select * from nivel3 where valormetroparque = "PIT" order by id')
        console.log( zona, manzana, parcela)
         lotee = await pool.query('select * from lotes where zona = ? and manzana =? and  parcela =? ', [zona, manzana, parcela])
    }else{
        valormetro= await pool.query('select * from nivel3 where valormetroparque != "PIT" order by id')
         lotee = await pool.query('select * from lotes where zona = ? and manzana =? and  lote =? ', [zona, manzana, lote])
    }

   


    try {
        valor = valormetro[(valormetro.length-1)]['valormetrocuadrado']  
      
    } catch (error) {
        
    }
 
   if  (valor != undefined){
   
    try {
  
 
    let final = lotee[0]['superficie'] * valor
    const anticipo = final*0.2
    const estado = lotee[0]['estado']

    const nombre = 'Zona: '+ lotee[0]['zona'] +' Manzana: '+lotee[0]['manzana']  +' Parcela: '+lotee[0]['parcela']
    finalSant= final*0.8
    const cuotas60 = finalSant/60
   
        let puede=true
    let cuotamuygrande =""
  
   
    let lotetieneasignado =""
    if ((estado != "DISPONIBLE" &&  "Disponible") ){
        lotetieneasignado='El lote no se encuentra disponible'
        puede=false
    }

    const detalle = {
        precio: final.toFixed(2),
        anticipo,
        finalSant,
        superficie: lotee[0]['superficie'],
        nombre: nombre,
        cuotas60: cuotas60.toFixed(2),
        estado:estado,
        cuotamuygrande,
        lotetieneasignado,
        puede,
        valor
    }
    console.log(detalle)

    res.json(detalle)
 } catch (error) {
    console.log(error)
        res.send('Algo salio mal ')
    }}else {  res.send('Algo salio mal ') }

})


module.exports = router


