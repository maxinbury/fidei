const express = require('express')
const router = express.Router()
const pool = require('../database')
const { isLoggedIn } = require('../lib/auth') //proteger profile
const { isLevel2 } = require('../lib/authnivel2')






// LISTA DE CONSTANCIAS PENDIENTS

router.get('/', async (req, res) => {
    const pendientes = await pool.query("Select * from constancias where estado = 'P'")


    res.render('aprobaciones/aprobaciones', { pendientes })

})
// APROBACION DE CONSTANCIA

router.get('/aprobarcomp/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params
    try {


        await pool.query('UPDATE constancias set estado = ? WHERE id = ?', ["A", id])


        let aux = await pool.query('select * from constancias  WHERE id = ?', [id])
        const cuil_cuit = aux[0]['cuil_cuit']
        aux = await pool.query('select * from constancias where cuil_cuit = ?', [cuil_cuit])




        aux = await pool.query('select * from constancias  WHERE tipo = "Dni" and estado ="A" and cuil_cuit = ?', [cuil_cuit])
        if (aux.length > 0) {
            
            aux = await pool.query('select * from constancias  WHERE tipo ="djorigen" and estado="A" and cuil_cuit = ?', [cuil_cuit])
            if (aux.length > 0) {
                aux = await pool.query('select * from constancias  WHERE tipo ="djdatospers" and estado="A" and cuil_cuit = ?', [cuil_cuit])
                if (aux.length > 0) {
                    aux = await pool.query('select * from constancias  WHERE tipo ="djcalidadpers" and estado="A" and cuil_cuit = ?', [cuil_cuit])
                    if (aux.length > 0) {
                        aux = await pool.query('select * from constancias  WHERE tipo ="Domicilio" and estado="A" and cuil_cuit = ?', [cuil_cuit])
                        if (aux.length > 0) {
                            aux = await pool.query('select * from constancias  WHERE tipo ="Balance" and estado="A" and cuil_cuit = ?', [cuil_cuit])
                            if (aux.length > 0) {
                                aux = await pool.query('select * from constancias  WHERE tipo ="DjIVA" and estado="A" and cuil_cuit = ?', [cuil_cuit])
                                if (aux.length > 0) {
                                    aux = await pool.query('select * from constancias  WHERE tipo ="Djprovision" and estado="A" and cuil_cuit = ?', [cuil_cuit])
                                    if (aux.length > 0) {
                                         aux = await pool.query('select * from users  WHERE cuil_cuit = ?', [cuil_cuit])
                                         console.log(aux)
                                        if (aux[0]['razon'] > 'Empresa') { // si es empresa

                                            aux = await pool.query('select * from constancias  WHERE tipo ="Estatuto" and estado="A" and cuil_cuit = ?', [cuil_cuit])
                                            if (aux.length > 0) {
                                                aux = await pool.query('select * from constancias  WHERE tipo ="Actaorgano" and estado="A" and cuil_cuit = ?', [cuil_cuit])
                                                if (aux.length > 0) {
                                                    console.log("entra")
                                                    aux = await pool.query('select * from constancias  WHERE tipo ="ConstAFIP" and estado="A" and cuil_cuit = ?', [cuil_cuit])
                                                    if (aux.length > 0) {
                                                        await pool.query("UPDATE users set habilitado = ? WHERE cuil_cuit = ?", ["SI", cuil_cuit])
                                                    }
                                                }

                                            }


                                        } else { // si es persona

                                            aux = await pool.query('select * from constancias  WHERE tipo ="const_cuil" ="A" and cuil_cuit = ?', [cuil_cuit])
                                            if (aux.length > 0) {
                                               await pool.query("UPDATE users set habilitado = ? WHERE cuil_cuit = ?", ["SI", cuil_cuit])
                                            }

                                        }
                                    }

                                }
                            }
                        }
                    }
                }
            }
        }
    } catch (error) {
        console.log(error)
    }

    //
    req.flash('success', 'Aprobado')
    res.redirect('/aprobaciones/')
})

////RECHAZO DE COMPROBANTE PAGINA DE RELLENO
router.get('/rechazarcomp/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params

    const pendiente = await pool.query("Select * from constancias where id=?", [id])


    res.render('aprobaciones/rechazar', { pendiente })

})
///ACCION RECHAZO DE CONSTANCIAS

router.post("/rechazo", isLoggedIn, async (req, res) => {
    const { id, asunto, cuil_cuit, descripcion, nombre } = req.body;
    console.log(asunto)

    await pool.query('UPDATE constancias set estado = ? WHERE id = ?', ["R", id])

    leida = "No"
    const noti = {
        cuil_cuit,
        descripcion,
        asunto,
        leida
    }
    await pool.query('INSERT INTO notificaciones set ?', [noti])

    res.redirect('/aprobaciones/')

})

//-------FIN CONSTANCIAS 
router.get('/solicitaraprobacion', isLoggedIn, isLevel2, async (req, res) => {
    const pendientes = await pool.query("Select * from cbus where estado = 'P'")
    res.render('aprobaciones/aprobacionescbu', { pendientes })

})

//-----INICIO CBUS 


//LISTA DE CBUS PENDIENTES

router.get('/cbu', isLoggedIn, isLevel2, async (req, res) => {
    const pendientes = await pool.query("Select * from cbus where estado = 'P'")
    res.render('aprobaciones/aprobacionescbu', { pendientes })

})


// APROBACION DE CBU Y ACTUALIZACION DE LA MISMA PAGINA 

router.get('/aprobarcbu/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params

    await pool.query('UPDATE cbus set estado = ? WHERE id = ?', ["A", id])
    const descripcion = 'Solicitud CBU aprobada'
    const cuil_cuit = (await pool.query('Select cuil_cuit from cbus where id=?', [id]))[0]['cuil_cuit']
    leida = "No"
    const asunto = "Cbu aprobado"
    const noti = {
        cuil_cuit,
        descripcion,
        asunto,
        leida
    }

    await pool.query('INSERT INTO notificaciones set ?', [noti])
    req.flash('success', 'Aprobado')
    res.redirect('/aprobaciones/cbu')
})



// RECHAZO DE CBU PAGINA DE RELLENO 
router.get('/rechazarcbu/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params

    const pendiente = await pool.query("Select * from cbus where id=?", [id])


    res.render('aprobaciones/rechazarcbu', { pendiente })

})

// RECHAZO DE CBU ACCION Y REDIRECCION

router.post("/rechazocbu", isLoggedIn, async (req, res) => {
    const { id, asunto, cuil_cuit, descripcion, nombre } = req.body;
    console.log(id)

    await pool.query('UPDATE constancias set estado = ? WHERE id = ?', ["R", id])

    leida = "No"
    const noti = {
        cuil_cuit,
        descripcion,
        asunto,
        leida
    }
    await pool.query('INSERT INTO notificaciones set ?', [noti])

    res.redirect('/aprobaciones/')

})


//-- FIN CBUS


/*
 const idaux = await pool.query('SELECT id_cliente FROM constancias WHERE id = ?',[id])
     console.log(idaux[0]['id_cliente'])
 await pool.query('UPDATE constancias set estado = ? WHERE id = ?', ["A", id])
 req.flash('success', 'Aprobado')
 const cant = await pool.query('Select count(*) from constancias WHERE id_cliente = ? and estado = "P"',[idaux[0]['id_cliente']])
 
 console.log(cant[0]['count(*)'])

 if (cant[0]['count(*)'] == 0 ){
     
     await pool.query("UPDATE users set habilitado = ? WHERE id = ?", ["SI", idaux[0]['id_cliente']])
 }
 res.redirect('/aprobaciones/')*/

////////////////////////////////////








module.exports = router
