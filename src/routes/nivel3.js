const express = require('express')
const router = express.Router()
const pool = require('../database')
const ponerguion = require('../public/apps/transformarcuit')

const { isLoggedIn, isLoggedInn3 } = require('../lib/auth') //proteger profile
const XLSX = require('xlsx')
const passport= require('passport')
const agregaricc = require('./funciones/agregaricc')
const { historialIcc, pagoSi, borrarHistorial, asignarClave, asignarvalormetroc, consultarIcc, agregarIccGral2 } = require('../controladores/nivel3Controlador')

router.post('/signupp', isLoggedInn3, passport.authenticate('local.signupnivel3', {
    successRedirect: '/exitosignup',
    failureRedirect:'/noexito',
    failureFlash:true

}))

//REACT GET HISTORIAL
router.get('/historialicc', isLoggedInn3, historialIcc)


//// PAGOS INUSUALES
router.get('/pagosi', pagoSi)



router.get('/borrarhistorial', isLoggedInn3, borrarHistorial)

/// ASIGNAR CLAVE PARA REGISTRO DE CLIENTES
router.post('/asignarclave',isLoggedInn3,asignarClave )



router.post('/asignarvalormetroc',isLoggedInn3, asignarvalormetroc)


//// Controla si ya eciste un ICC asignado
router.post('/consultaricc',isLoggedInn3, consultarIcc)

///// REACT ii gral
router.post('/agregariccgral2', isLoggedInn3,agregarIccGral2 )
//////

///// AGREGA a ICC al IC3
router.post('/agregariccgral22', isLoggedInn3,agregarIccGral2)

//ACCESO A MENU DE USUARIO NIVEL 2
// AGREGAR USUARIO 


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
router.get("/habilitarusuario/:cuil_cuit", isLoggedIn, async (req, res) => {
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
router.get("/deshabilitarusuario/:cuil_cuit", isLoggedIn, async (req, res) => {
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
router.post('/agregariccgral', async (req, res,) => {
    const { ICC, mes, anio, zona } = req.body;
    console.log('icc gral')
    const todas = await pool.query("select * from cuotas where mes =? and anio =? and zona = ?", [mes, anio,zona])
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
