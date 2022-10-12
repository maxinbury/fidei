const express = require('express')
const router = express.Router()
const pool = require('../database')
const { isLevel2 } = require('../lib/authnivel2')
const {isLoggedIn, isLoggedInn, isLoggedInn2, isLoggedInn3 } = require('../lib/auth') //proteger profile




///////////////// REALIZAR PAGO MANUAL NIVEL 2 

router.post('/pagonivel2', isLoggedInn2, async (req, res) => { // pagot es el objeto pago
    let { id, tipo, cuil_cuit, monto } = req.body

    ///// cuil_cuit es del usuario que esta ene l sistema

    //var pagot = await pool.query('select * from pagos where id = ?', [id]) PAGO QUE HAY QUE CREAR

    //


    const cuota = await pool.query('select * from cuotas where id = ?', [id]) //objeto cuota

    let saldo_realc = cuota[0]["Saldo_real"]
    console.log(saldo_realc)
    let nro_cuota = (cuota[0]["nro_cuota"])
    let id_lote = cuota[0]["id_lote"]
    //// hasta aca se trae la cuota

    try {


        Saldo_real = parseFloat(saldo_realc) - monto
        let pago = parseFloat(monto) + parseFloat(cuota[0]["pago"])



        const nuevo = {
            //  Saldo_real,
            monto,
            cuil_cuit_administrador: cuil_cuit,
            tipo,
            id_cuota: id



        }

        const update = {
            Saldo_real,
            pago,

        }
        console.log(update)
        console.log(nuevo)

        await pool.query('UPDATE cuotas set  ? WHERE id = ?', [update, id])

        await pool.query('INSERT INTO pagos set ?', [nuevo]);


        console.log('idlote' + id_lote)
        cant_finales = await pool.query('select * from cuotas  WHERE id_lote = ? and parcialidad = "Final"', [id_lote])


        if (nro_cuota < cant_finales.length) {/// aca esta el errror



            for (var i = (nro_cuota + 1); i <= cant_finales.length; i++) {

                try {//

                    aux = await pool.query('select *from cuotas WHERE id_lote = ? and nro_cuota=?', [id_lote, i])
                    console.log(aux)
                    saldo_realc = parseFloat(aux[0]["Saldo_real"])
                    console.log('saldoreal ' + saldo_realc)
                    idaux = aux[0]["id"]
                    console.log(id)

                    console.log('pagop' + pago)
                    Saldo_real = saldo_realc - monto
                    console.log(Saldo_real)
                    const update = {
                        Saldo_real,



                    }
                    await pool.query('UPDATE cuotas set  ? WHERE id = ?', [update, idaux])
                } catch (error) {//

                }

            }
        }


        console.log(cuota[0]['cuil_cuit'])
        res.send([cuota[0]['cuil_cuit'], 'Pago Realizado'])



    } catch (error) {
        res.send([cuota[0]['cuil_cuit'], 'Pago Realizado'])
    }

})
/// aprobar pago nivel 2
router.post('/aprobarr/', isLoggedInn2, async (req, res) => { // pagot es el objeto pago
    const { id, montonuevo, cambiarmonto } = req.body
    // pagot es el objeto pago
    let pagot = await pool.query('select * from pagos where id = ?', [id])

    let id_cuota = pagot[0]["id_cuota"]
    let monto = pagot[0]["monto"]
    if (cambiarmonto) {////// toma el valor del checkbox si se modifica el monto 
        monto = montonuevo
    }

    ///////////
    const cuota = await pool.query('select * from cuotas where id = ?', [id_cuota]) //objeto cuota
     let cuota_con_ajuste = cuota[0]["cuota_con_ajuste"]
    let saldo_realc = cuota[0]["Saldo_real"]
    let nro_cuota = cuota[0]["nro_cuota"]
    let id_lote = cuota[0]["id_lote"]



    try {
        /*
        if (cuota_con_ajuste < cuota[0]["pago"] + parseFloat(monto)) {
            Saldo_real = parseFloat(saldo_realc) - cuota_con_ajuste
            diferencia = cuota[0]["pago"] + parseFloat(monto) - cuota_con_ajuste


        } else {

            Saldo_real = parseFloat(saldo_realc) - parseFloat(monto)
            diferencia = 0

        }
 */

        let pago = cuota[0]["pago"] + parseFloat(monto)


        // Saldo_real = cuota[0]["saldo_inicial"] -saldo_realc  - pago 



      /*  const update = {
            Saldo_real,
            pago,
            diferencia


        }

        await pool.query('UPDATE cuotas set  ? WHERE id = ?', [update, cuota[0]["id"]])*/
   
        cant_finales = await pool.query('select * from cuotas  WHERE id_lote = ? and parcialidad = "Final" order by nro_cuota', [id_lote])
           
       
        diferencia = parseFloat(cant_finales[nro_cuota - 1]["diferencia"])
        ///
          bandera =true
          console.log(bandera)
        for (ii = (nro_cuota - 1); ii < cant_finales.length; ii++) {
            console.log(ii)


            // aux = await pool.query('select *from cuotas WHERE id_lote = ? and nro_cuota=?', [id_lote, i]) //cuota concurrente
            cuota_con_ajuste = cant_finales[ii]["cuota_con_ajuste"]
            saldo_realc = cant_finales[ii]["Saldo_real"]
            console.log('saldo real')
            console.log(saldo_realc)
            console.log(cant_finales[ii]["nro_cuota"])
            if (bandera){
                auxx=parseFloat(monto)
                bandera=false
            }else {
                auxx=0
            }
            console.log(auxx)
            console.log(cuota_con_ajuste)
            console.log(bandera)
            if (cant_finales[ii]["nro_cuota"]>1){
                anterior = await pool.query('select * from cuotas where  id_lote = ? and nro_cuota = ?',[id_lote,(cant_finales[ii]["nro_cuota"]-1)])
                console.log(anterior)
                auxx= auxx + anterior[0]['diferencia']
            }
            if (cuota_con_ajuste < parseFloat(cant_finales[ii]["pago"]) + auxx+ diferencia) {


                console.log('pasa')
                Saldo_real = parseFloat(cant_finales[ii]["saldo_cierre"])
                
                diferencia =  auxx + parseFloat(cant_finales[ii]["pago"]) - cuota_con_ajuste
                console.log(diferencia)
               //////diferencia suma el doble el que ya estaba

            } else {
                console.log(diferencia)
                Saldo_real = parseFloat(saldo_realc) - parseFloat(monto)
                diferencia = 0
                console.log('no pasa')
                
            }

            idaux = cant_finales[ii]["id"]
            a = ii
            //  Saldo_real = saldo_realc - monto
            if ((a + 1) == nro_cuota) {
                console.log('entra')
                update = {
                    Saldo_real,
                    pago,
                    diferencia
                }


            } else {
                update = {
                    Saldo_real,
                    diferencia
                }
                console.log(update)
            }

            await pool.query('UPDATE cuotas set  ? WHERE id = ?', [update, idaux])


        }



      


    } catch (error) {
        console.log(error)
    }

})


///// Detalles del pago 
router.get("/detallespago/:id", async (req, res) => {
    const { id } = req.body
    console.log(id)

    const detalles = await pool.query('SELECT * FROM pagos where id_cuota = ?', [id])

    res.json(detalles)
    //*  res.json(cantidad[0]["count(*)"])
})

router.get("/cantidadpendientes", isLoggedInn2, async (req, res) => {
    try {
        const detalles = await pool.query('SELECT count(*) FROM pagos where estado="p" or estado="justificacionp" ')
        const rta = detalles[0]['count(*)']

        const legajos = await pool.query('SELECT count(*) FROM constancias where estado= "Pendiente"  ')
        const cantlegajos = legajos[0]['count(*)']

        const cbus = await pool.query('SELECT count(*) FROM cbus where estado= "P"  ')
        const cantcbus = cbus[0]['count(*)']

        console.log(cantcbus)
        res.json([rta, cantlegajos, cantcbus])
    } catch (error) {

    }


})



/////detalles de todos los pagos de una cuota
router.post("/detallespagos", isLoggedInn2, async (req, res) => {
    const { id } = req.body
    console.log(id)
    const pagos = await pool.query('SELECT * FROM pagos where id_cuota = ? and estado = "A"', [id])




    res.json(pagos)
})


///////// Cantidad inusuales 
router.get("/cantidadinusuales", isLoggedInn3, async (req, res) => {
    const cantidad = await pool.query('SELECT count(*) FROM historial_pagosi where estado = "Pendiente"')
    res.json(cantidad)
    //*  res.json(cantidad[0]["count(*)"])
})

///////// reaxct
router.get("/listainusual", isLoggedInn2, async (req, res) => {
    const pagos = await pool.query('SELECT * FROM pagos join clientes on pagos.cuil_cuit= clientes.cuil_cuit where estado="averificarnivel3"')
    console.log(pagos)
    res.json(pagos)
})

//react pendientes
router.get('/pendientess', isLoggedInn2, async (req, res) => {
    // const pendientes = await pool.query("Select * from pagos join estado_pago on pagos.estado=estado_pago.id_estado_pago where estado = 'P' or estado = 'ajustificar' ")
    const pendientes = await pool.query("Select * from pagos join estado_pago on pagos.estado=estado_pago.id_estado_pago where estado = 'P'  or estado='justificacionp' ")

    res.json(pendientes)




})

///// aprobar react


///// inusuales mensuales react
router.post("/mensualesinusuales", isLoggedInn3, async (req, res) => {
    const { mes, anio } = req.body
    console.log(mes)
    console.log(anio)
    const pagos = await pool.query('select * from historial_pagosi join clientes on historial_pagosi.cuil_cuit= clientes.cuil_cuit where historial_pagosi.mes =? and historial_pagosi.anio=?', [mes, anio])
    console.log(pagos)
    if (pagos.length > 0) {
        res.json(pagos)
    } else { res.json([]) }


})

////////rechazar 
router.post("/rechazarr", isLoggedInn2, async (req, res) => {
    const { id, detalle, accion } = req.body

    auxi = await pool.query('select *  from pagos where id=?', [id]);
    cuil_cuit = auxi[0]['cuil_cuit']


    switch (accion) {
        case 'rechazar':
            console.log('rechazar')
            estado = 'averificarnivel3'
            //Declaraciones ejecutadas cuando el resultado de expresión coincide con el valor1



            break;
        case 'solicitar_doc':
            console.log('solicitar_doc')
            estado = 'ajustificar'
            //Declaraciones ejecutadas cuando el resultado de expresión coincide con el valor2
            const update2 = {
                leida: "No",
                cuil_cuit: cuil_cuit,
                id_referencia: id,
                descripcion: detalle,
                asunto: 'Solicitud de documentacion'
            }
            await pool.query('INSERT INTO notificaciones set ?', [update2]);
            break
    }


    const update = {
        estado

    }

    try {
        await pool.query('UPDATE pagos set  ? WHERE id = ?', [update, id])
        const aux = await pool.query('select * from  pagos  WHERE id = ?', [id])
        cuil_cuit = aux[0]['cuil_cuit']

    } catch (error) {
        console.log(error)
        res.send('algo salio mal')
    }

    res.send('Todo en orden')


})



///////

router.get("/", isLevel2, async (req, res) => {
    const pagos = await pool.query('SELECT * FROM pagos ')
    res.render('pagos/listap', { pagos })
})

router.get('/aprobar/:id', isLoggedIn, isLevel2, async (req, res) => { // pagot es el objeto pago
    const { id } = req.params

    var pagot = await pool.query('select * from pagos where id = ?', [id])

    let auxiliar = pagot[0]["id_cuota"]

    const cuota = await pool.query('select * from cuotas where id = ?', [auxiliar]) //objeto cuota
    console.log(cuota)// aca ver error


    try {
        if (cuota[0]["nro_cuota"] === 1) {
            var saldo_realc = cuota[0]["Saldo_real"]

        } else {
            const cuotaant = await pool.query("Select * from cuotas where cuil_cuit=? and nro_cuota= ?", [cuota[0]["cuil_cuit"], (cuota[0]["nro_cuota"]) - 1])
            console.log(cuotaant[0]["Saldo_real"])
            console.log(cuota[0]["Saldo_real"])
            saldo_realc = cuotaant[0]["Saldo_real"] + cuota[0]["cuota_con_ajuste"]
            saldo_inicial = cuotaant[0]["Saldo_real"]

        }

    } catch (error) {
        console.log(error)
        res.redirect('/profile')


    }

    let pago = cuota[0]["pago"] + pagot[0]["monto"]


    // Saldo_real = cuota[0]["saldo_inicial"] -saldo_realc  - pago 
    Saldo_real = saldo_realc - pago


    const update = {
        Saldo_real,
        pago,
        saldo_inicial,

    }

    await pool.query('UPDATE cuotas set  ? WHERE id = ?', [update, cuota[0]["id"]])




    await pool.query('UPDATE pagos set estado = ? WHERE id = ?', ["A", id])
    req.flash('success', 'Guardado correctamente')



    res.redirect('/profile')
})






router.get('/realizara/:id', isLoggedIn, isLevel2, async (req, res) => {
    const id = req.params.id // requiere el parametro id  c 
    const cuota = await pool.query('SELECT * FROM cuotas WHERE id= ?', [id])

    res.render('pagos/realizara', { cuota })

})
router.get('/realizar', isLoggedIn, isLevel2, async (req, res) => {

    res.render('pagos/realizar')

})

router.get('/pendientes', isLoggedIn, isLevel2, async (req, res) => {
    const pendientes = await pool.query("Select * from pagos where estado = 'P'")
    console.log(pendientes)
    res.render('pagos/pendientes', { pendientes })

})



router.post('/realizar', async (req, res) => {
    let { monto, id } = req.body;
    const estado = 'A'
    cuota = await pool.query('select * from cuotas WHERE id = ?'[id])
    console.log(cuota)
    monto += cuota[0]['monto']

    const newLink = {
        monto,

        estado,


    };
    await pool.query('UPDATE cuotas set ? WHERE id = ?'[newLink, id])


    req.flash('success', 'Guardado correctamente')
    res.redirect(`../links/clientes`);





})









module.exports = router



