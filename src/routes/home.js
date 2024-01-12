const express = require('express')
const router = express.Router()
const pool = require('../database')




router.post('/calcularvalor', async (req, res) => {
    const { zona, manzana, parcela, cuil_cuit,lote } = req.body
   

    if (zona==='PIT'){
        valormetro= await pool.query('select * from nivel3 where valormetroparque = "PIT" order by id')
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

    res.json(detalle)
 } catch (error) {
        res.send('Algo salio mal ')
    }}else {  res.send('Algo salio mal ') }

})









module.exports = router