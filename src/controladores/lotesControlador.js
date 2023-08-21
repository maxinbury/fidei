const express = require('express')
const router = express.Router()
const pool = require('../database')

const { isLoggedIn, isLoggedInn2} = require('../lib/auth') //proteger profile
const XLSX = require('xlsx')
const { EC2 } = require('aws-sdk')

///////

const loteCliente =async (req, res) => {
    cuil_cuit = req.params.cuil_cuit


    lotes = await pool.query('select  cuil_cuit, id,zona, fraccion, manzana, lote, parcela from lotes where cuil_cuit =  ?', [cuil_cuit]);
    console.log('lotes')
    console.log(lotes)


    res.json(lotes)

}


const calcularValor = async (req, res) => {
    const { zona, manzana, parcela, cuil_cuit,lote } = req.body
   

    if (zona==='PIT'){
        valormetro= await pool.query('select * from nivel3 where valormetroparque = "PIT" order by id')
         lotee = await pool.query('select * from lotes where zona = ? and manzana =? and  parcela =? ', [zona, manzana, parcela])
    }else{
        valormetro= await pool.query('select * from nivel3 where valormetroparque != "PIT" order by id')
         lotee = await pool.query('select * from lotes where zona = ? and manzana =? and  lote =? ', [zona, manzana, lote])
    }

   
    console.log(valormetro)

    try {
        valor = valormetro[(valormetro.length-1)]['valormetrocuadrado']  
      
    } catch (error) {
        console.log(error)
    }
 
   if  (valor != undefined){
   
    try {
       const  aux= '%'+cuil_cuit+'%'
   const cliente = await pool.query('select * from clientes where cuil_cuit like ? ', aux)
   console.log('cliente '+cliente )
   const ingresos = cliente[0]['ingresos']
   if (cliente[0]['expuesta']==='SI' ){
    max = ingresos*0.2
   }else{  max = ingresos*0.3}
  

 
    let final = lotee[0]['superficie'] * valor
    const anticipo = final*0.2
    const estado = lotee[0]['estado']

    const nombre = 'Zona: '+ lotee[0]['zona'] +' Manzana: '+lotee[0]['manzana']  +' Parcela: '+lotee[0]['parcela']
    finalSant= final*0.8
    const cuotas60 = finalSant/60
   
        let puede=true
    let cuotamuygrande =""
    if (max <= cuotas60){
        if (cliente[0]['expuesta']==='SI' ){
            cuotamuygrande='La cuota es mas grande que  el 20% (PEP)'
        }else{
            cuotamuygrande='La cuota es mas grande que  el 30%'
        }
        
        puede=false
    }
   
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
        ingresos: ingresos,
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

}


const loteCliente2 = async (req, res) => {
    cuil_cuit = req.params.cuil_cuit


    lotes = await pool.query('select  cuil_cuit, id,zona, fraccion, manzana, lote from lotes where cuil_cuit like  ?', [cuil_cuit]);
    console.log(lotes)


    res.json(lotes)

}



const traerlotesleg = async (req, res) => {
 
    try {
        const lotes = await pool.query('select distinct(fraccion) from lotes where zona="Legales"')
        
res.json(lotes)
    } catch (error) {
        console.log(error)
        res.json("Error")
    }

}

const listadeTodos = async (req, res) => {
 
    const lotes = await pool.query('select * from lotes')
    const disponibles = await pool.query('select * from lotes where estado = "DISPONIBLE" or estado = "disponible"')
    const parque = await pool.query('select * from lotes where (estado = "DISPONIBLE" or estado = "disponible") and zona ="PIT"')
    const ic3 = await pool.query('select * from lotes where (estado = "DISPONIBLE" or estado = "disponible") and zona ="IC3" ')

    console.log(disponibles.length)

    res.json([lotes,disponibles.length,parque.length,ic3.length])
}

const lista2 = async (req, res) => {
 
    const lotes = await pool.query('select * from lotes where zona ="Legales"')
    const disponibles = await pool.query('select * from lotes where (estado = "DISPONIBLE" or estado = "disponible") and zona ="Legales"')


    res.json([lotes,disponibles.length])
}

const listadeLotes = async (req, res) => {

    const zona = await pool.query('select zona from lotes group by=zona')


    res.json(zona)
}

const desasignarlote = async (req, res) => {
const id = req.params.id
    

await pool.query('UPDATE lotes SET cuil_cuit=?,estado=? WHERE id=? ',["0","libre",id])


    res.json("realizado")
}






const traermanzanas = async (req, res) => {

    const exi = await pool.query('select * from manzanas ')
    res.json(exi)
}

const nuevamanzana = async (req, res) => {
    const {manzana} = req.body
    try { 
        const nuevo={
       manzana
    }
    
     const exi = await pool.query('select * from manzanas where  manzana=? ',[ manzana])
    console.log(exi)
    if (exi.length>0){
        res.json("Error, lote ya existe")
    }else{
         await pool.query('insert into manzanas set ?',[nuevo])
    res.json("Realizado")
    }
    
    
        
    } catch (error) {
        console.log(error)
        res.json("No realizado")
    }
       
    

}



const nuevolote = async (req, res) => {
const {parcela, manzana, fraccion, adrema} = req.body
try { 
manzanaa = await pool.query('select *  from manzanas where id =?',[manzana])
 const exi = await pool.query('select * from lotes where  parcela=? and  manzana=? and  fraccion=? and zona=?',[ parcela, manzanaa[0]['manzana'], fraccion,"Legales"])
 const nuevo={
    parcela, manzana: manzanaa[0]['manzana'], fraccion:"Legales",adrema,
    zona:"Legales" 
}
console.log(nuevo)
if (exi.length>0){
    res.json("Error, lote ya existe")
}else{
     await pool.query('insert into lotes set ?',[nuevo])
res.json("Realizado")
}


    
} catch (error) {
    console.log(error)
    res.json("No realizado")
}
   

}



module.exports = {
    traerlotesleg,
    lista2,
    nuevolote,
    loteCliente,
    calcularValor,
    loteCliente2,
    listadeTodos,
    listadeLotes,
    desasignarlote,
    nuevamanzana,
    traermanzanas

}