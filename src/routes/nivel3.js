const express = require('express')
const router = express.Router()
const pool = require('../database')
const ponerguion = require('../public/apps/transformarcuit')
const { isLevel3 } = require('../lib/authnivel3')
const { isLoggedIn } = require('../lib/auth') //proteger profile
const XLSX = require('xlsx')



/*
//PERFIL USUARIO NIVEL 3
router.get('/profile', isLoggedIn, isLevel2, (req, res) => {

    res.render('links/add')

})
*/

//REACT GET HISTORIAL
router.get('/historialicc', async (req, res) => {

    const historial = await pool.query('select * from icc_historial')

    res.json(historial)

})

router.get('/pagosi', async (req, res) => {

    const historial = await pool.query('select * from historial_pagosi')

    res.json(historial)

})

router.get('/borrarhistorial', async (req, res) => {

    try {
        await pool.query('DELETE FROM icc_historial ')
        res.send('Borrados correctamente')
    } catch (error) {
        console.log(error)
        res.send('Error algo sucedió')
    }

})

router.post('/consultaricc', async (req, res,) => {
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
router.post('/agregariccgral2', async (req, res,) => {
    let { ICC, mes, anio } = req.body;
   console.log(mes)
    var datoss = {
        ICC,
        mes,
        anio

    }
    ICC= ICC/100
    //////////////try
    try {
        await pool.query('insert into icc_historial set?', datoss)
    } catch (error) {
        
    }
    
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
           
            var cuota = {
                ICC,
                Ajuste_ICC,
                Base_calculo,
                cuota_con_ajuste,
               
                parcialidad
    
            }

        } else {
            const anterior = await pool.query('Select * from cuotas where nro_cuota = ? and cuil_cuit = ?', [nro_cuota - 1, cuil_cuit])
           
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
            res.send('Error');

        }



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




//PAGINA  AGREGAR ICC GENERAL
router.get("/agregariccgral", isLoggedIn,isLevel3, async (req, res) => {


    res.render('cuotas/agregariccgral')
})
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
