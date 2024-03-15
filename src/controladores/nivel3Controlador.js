const express = require('express')
const router = express.Router()
const pool = require('../database')
const ponerguion = require('../public/apps/transformarcuit')
const { isLoggedIn, isLoggedInn3 } = require('../lib/auth') //proteger profile
const XLSX = require('xlsx')
const passport= require('passport')
const agregaricc = require('../routes/funciones/agregaricc')


const historialIcc =  async (req, res) => {

    const historial = await pool.query('select * from icc_historial')

    res.json(historial)

}

const pagoSi = async (req, res) => {

    const historial = await pool.query('select * from historial_pagosi')

    res.json(historial)

}

const borrarHistorial = async (req, res) => {

    try {
        await pool.query('DELETE FROM icc_historial ')
        res.send('Borrados correctamente')
    } catch (error) {
      //  console.log(error)
        res.send('Error algo sucedió')
    }

}

const asignarClave = async (req, res) => {
    const  { cuil_cuit, clave_alta  } = req.body;
    try {
      
       
        const aux = '%'+cuil_cuit+'%'
        const existe = await pool.query('select * from clientes WHERE cuil_cuit like  ?',[aux])
        if (existe.length>0){
            const asignar = {
                clave_alta: clave_alta
               }
               await pool.query('UPDATE clientes set ? WHERE cuil_cuit like  ?', [asignar,aux])
               res.send('Clave asignada')
        }else {
            res.send('Error cliente no existe')
        }
        

      

    } catch (error) {
       
        res.send('Error algo sucedió')
    }

}

const asignarvalormetroc = async (req, res) => {
    const  { valor,zona } = req.body;
    try {
    
        fecha = (new Date(Date.now())).toLocaleDateString()
        
            val ={valormetrocuadrado:valor,
                valormetroparque:zona,
                fecha } 
          
                
        await pool.query('insert into nivel3 set ?', val)
        res.send('Borrados correctamente')

    } catch (error) {
       // console.log(error)
        res.send('Error algo sucedió')
    }

}

const consultarIcc = async (req, res,) => {
    let { ICC, mes, anio, zona } = req.body;
    let rta={} 
try {
        const existe = await pool.query('select * from icc_historial where mes=? and anio=? and zona =?',[mes,anio, zona])
        if (existe.length>0){
         
         const valor = existe[0]['ICC']
        
            rta= {
                resp:'El mes y año ya tiene un ICC asignado y es '+valor

            }
        }else{
  
            rta= {
                resp:'El mes y año no tienen un ICC asignado'

            }
          

        }
   
        res.json(rta)
    } catch (error) {
        
   }


}

const agregarIccgral = async (req, res,) => {
    let { ICC, mes, anio, zona } = req.body;
   
    let datoss = {
        ICC,
        mes,
        anio,
        zona

    }

    //////////////try
    

    try {

        exis =  await pool.query("select * from icc_historial where mes =? and anio =? and zona=?", [mes, anio,zona])
        if (exis.length>0){
            await pool.query('UPDATE icc_historial set ? WHERE id = ?', [datoss, exis[0]["id"]])
        }else{

        await pool.query('insert into icc_historial set?', datoss)}
    } catch (error) {
       // console.log(error)
    }



    const todas = await pool.query("select * from cuotas where mes =? and anio =? and zona =?", [mes, anio,zona])

    for (var i = 0; i < todas.length; i++) {  

    await agregaricc.calcularicc(todas[i],ICC)
}

res.send('Icc asignado con éxito');
}

const agregarIccGral2 =async (req, res,) => {
    let { ICC, mes, anio, zona } = req.body;
   


    let datoss = {
        ICC,
        mes,
        anio,
        zona

    }

    //////////////try
    //console.log(datoss)




    const todas = await pool.query("select * from cuotas where mes =? and anio =? and zona =? ", [mes, anio, zona])

    for (let i = 0; i < todas.length; i++) {  

    agregaricc.calcularicc(todas[i],ICC)
}
try {

    exis =  await pool.query("select * from icc_historial where mes =? and anio =? and zona=?", [mes, anio,zona])
    if (exis.length>0){
        await pool.query('UPDATE icc_historial set ? WHERE id = ?', [datoss, exis[0]["id"]])
    }else{

    await pool.query('insert into icc_historial set?', datoss)}
} catch (error) {
   // console.log(error)
}
res.send('Icc asignado con éxito');
}
module.exports = {
    historialIcc,
    pagoSi,
    borrarHistorial,
    asignarClave,
    asignarvalormetroc,
    consultarIcc,
    agregarIccgral,
    agregarIccGral2


}