const express = require('express')
const router = express.Router()
const pool = require('../database')
const ponerguion = require('../public/apps/transformarcuit')
const { isLevel3 } = require('../lib/authnivel3')
const { isLoggedIn, isLoggedInn3 } = require('../lib/auth') //proteger profile
const XLSX = require('xlsx')
const passport= require('passport')
const agregaricc = require('./funciones/agregaricc')

router.post('/signupp', isLoggedInn3, passport.authenticate('local.signupnivel3', {
    successRedirect: '/exitosignup',
    failureRedirect:'/noexito',
    failureFlash:true

}))

//REACT GET HISTORIAL
router.get('/historialicc', isLoggedInn3, async (req, res) => {

    const historial = await pool.query('select * from icc_historial')

    res.json(historial)

})

router.get('/pagosi', async (req, res) => {

    const historial = await pool.query('select * from historial_pagosi')

    res.json(historial)

})

router.get('/borrarhistorial', isLoggedInn3, async (req, res) => {

    try {
        await pool.query('DELETE FROM icc_historial ')
        res.send('Borrados correctamente')
    } catch (error) {
        console.log(error)
        res.send('Error algo sucedió')
    }

})


router.post('/asignarclave',isLoggedInn3, async (req, res) => {
    const  { cuil_cuit, clave_alta  } = req.body;
    console.log(cuil_cuit)
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

})



router.post('/asignarvalormetroc',isLoggedInn3, async (req, res) => {
    const  { valor,zona } = req.body;
    try {
    
        fecha = (new Date(Date.now())).toLocaleDateString()
        
            val ={valormetrocuadrado:valor,
                valormetroparque:zona,
                fecha } 
          
                
        await pool.query('insert into nivel3 set ?', val)
        res.send('Borrados correctamente')

    } catch (error) {
        console.log(error)
        res.send('Error algo sucedió')
    }

})



router.post('/consultaricc',isLoggedInn3, async (req, res,) => {
    let { ICC, mes, anio } = req.body;
    let rta={} 
try {
        const existe = await pool.query('select * from icc_historial where mes=? and anio=?',[mes,anio])
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


})

///// REACT ii gral
router.post('/agregariccgral2', isLoggedInn3, async (req, res,) => {
    let { ICC, mes, anio } = req.body;
   
console.log('iccgral2')

    let datoss = {
        ICC,
        mes,
        anio

    }

    //////////////try
    

    try {

        exis =  await pool.query("select * from icc_historial where mes =? and anio =?", [mes, anio])
        if (exis.length>0){
            await pool.query('UPDATE icc_historial set ? WHERE id = ?', [datoss, exis[0]["id"]])
        }else{

        await pool.query('insert into icc_historial set?', datoss)}
    } catch (error) {
        console.log(error)
    }



    const todas = await pool.query("select * from cuotas where mes =? and anio =?", [mes, anio])

    for (var i = 0; i < todas.length; i++) {  

    await agregaricc.calcularicc(todas[i],ICC)
}

res.send('Icc asignado con éxito');
})
//////

///// REACT ii gral menos los que estan
router.post('/agregariccgral22', isLoggedInn3, async (req, res,) => {
    let { ICC, mes, anio } = req.body;
   


    let datoss = {
        ICC,
        mes,
        anio

    }
    ICC= ICC/100
    //////////////try
    




    const todas = await pool.query("select * from cuotas where mes =? and anio =? and parcialidad = ?  ", [mes, anio,"Original"])

    for (let i = 0; i < todas.length; i++) {  

    agregaricc.calcularicc(todas[i],ICC)
}

res.send('Icc asignado con éxito');
})

//ACCESO A MENU DE USUARIO NIVEL 2
router.get('/perfilnivel2', isLoggedIn, isLevel3, async (req, res) => {

    const pagos_p = await pool.query(" Select * from pagos where estado = 'P' ")
    const constancias_p = await pool.query(" Select * from constancias where estado = 'P' ")
    const cbus = await pool.query(" Select * from cbus where estado = 'P' ")
    const chats = await pool.query(" Select * from chats where leido = 'NO' ")

res.render('profile',{pagos_p, constancias_p, cbus, chats})}

)

// AGREGAR USUARIO 

router.get('/agregarusuario', isLoggedIn, isLevel3, (req, res) => {

    res.render('nivel3/agregarusuario')

})

router.post('/agregarunusuario', async (req, res,) => {
    const { cuil_cuit, nombre, mail, nivel } = req.body;
 
const nuevo={
    cuil_cuit,
     nombre,
      mail,
       nivel 
}
  console.log(nuevo)



})

////////lista de usuarios
router.get('/traerusuarios',isLoggedInn3, async (req, res) => {

    const usuarios = await pool.query(" Select * from users  ")
    console.log(usuarios)

res.json(usuarios)
    
    }

)
///historial valor metro cuadrado 
router.get('/historialvalormetro',isLoggedInn3, async (req, res) => {

    const valores = await pool.query(" Select * from nivel3  ")
    console.log(valores)

res.json(valores)
    
    }

)

//Habilitar usuario para pagar
router.get("/habilitarusuario/:cuil_cuit", isLoggedIn,isLevel3, async (req, res) => {
    let { cuil_cuit } = req.params
    console.log(cuil_cuit)
    habilitado = 'SI'
    aux = {
        habilitado
    }
    await pool.query('UPDATE users set ? WHERE cuil_cuit = ?', [aux, cuil_cuit])
    cuil_cuit = ponerguion.ponerguion(cuil_cuit)
    res.redirect("/links/detallecliente/"+cuil_cuit)
})
//Habilitar usuario para pagar
router.get("/deshabilitarusuario/:cuil_cuit", isLoggedIn,isLevel3, async (req, res) => {
    let { cuil_cuit } = req.params
    habilitado = 'NO'
    aux = {
        habilitado
    }
    await pool.query('UPDATE users set ? WHERE cuil_cuit = ?', [aux, cuil_cuit])
    cuil_cuit = ponerguion.ponerguion(cuil_cuit)

    res.redirect("/links/detallecliente/"+cuil_cuit)
})

//ACCION DE  AGREGAR ICC GENERAL
router.post('/agregariccgral',isLevel3, async (req, res,) => {
    const { ICC, mes, anio } = req.body;
    console.log('icc gral')
    const todas = await pool.query("select * from cuotas where mes =? and anio =?", [mes, anio])
    const parcialidad = "Final"
    for (var i = 0; i < todas.length; i++) {
        nro_cuota = todas[i]["nro_cuota"]
        cuil_cuit = todas[i]["cuil_cuit"]
       
        if (nro_cuota == 1) {
        
            saldo_inicial = todas[i]["saldo_inicial"]
            const Ajuste_ICC = 0
            const Base_calculo = todas[i]["Amortizacion"]
            const cuota_con_ajuste = todas[i]["Amortizacion"]
            const Saldo_real = todas[i]["Amortizacion"]
            var cuota = {
                ICC,
                Ajuste_ICC,
                Base_calculo,
                cuota_con_ajuste,
                Saldo_real,
                parcialidad
    
            }

        } else {
            const anterior = await pool.query('Select * from cuotas where nro_cuota = ? and cuil_cuit = ?', [nro_cuota - 1, cuil_cuit])
            console.log(anterior)
            var Saldo_real_anterior = anterior[0]["Saldo_real"]
            
            const cuota_con_ajuste_anterior = anterior[0]["cuota_con_ajuste"]
            
            const Base_calculo = cuota_con_ajuste_anterior
            const Ajuste_ICC = cuota_con_ajuste_anterior * ICC
    
            const cuota_con_ajuste = cuota_con_ajuste_anterior + Ajuste_ICC
            Saldo_real_anterior += cuota_con_ajuste
            const Saldo_real = Saldo_real_anterior

            var cuota = {
                ICC,
                Ajuste_ICC,
                Base_calculo,
                cuota_con_ajuste,
                Saldo_real,
                parcialidad
    
            }
        }
    
        try {
            await pool.query('UPDATE cuotas set ? WHERE id = ?', [cuota, todas[i]["id"]])

        } catch (error) {
            console.log(error)
            res.redirect(`/cuotas`);

        }



    }

    res.redirect(`/profile`);
})






module.exports = router
