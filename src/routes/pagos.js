const express = require('express')
const router = express.Router()
const pool = require('../database')
const { isLevel2 } = require('../lib/authnivel2')
const { isLoggedIn } = require('../lib/auth') //proteger profile



///////// Cantidad inusuales 
router.get("/cantidadinusuales", async (req, res) => {
    const cantidad = await pool.query('SELECT count(*) FROM historial_pagosi where estado = "Pendiente"')
    res.json(cantidad)
  //*  res.json(cantidad[0]["count(*)"])
})

///////// reaxct
router.get("/listainusual", async (req, res) => {
    const pagos = await pool.query('SELECT * FROM historial_pagosi join clientes on historial_pagosi.cuil_cuit= clientes.cuil_cuit')
    res.json(pagos)
})

//react pendientes
router.get('/pendientess', async (req, res) => {
    const pendientes = await pool.query("Select * from pagos where estado = 'P'")

    res.json(pendientes)


})

///// aprobar react

router.get('/aprobarr/:id', async (req, res) => { // pagot es el objeto pago
    const { id } = req.params

    var pagot = await pool.query('select * from pagos where id = ?', [id])

    let id_cuota = pagot[0]["id_cuota"]

    const cuota = await pool.query('select * from cuotas where id = ?', [id_cuota]) //objeto cuota
    console.log(cuota)// aca ver error
    var saldo_realc = cuota[0]["Saldo_real"]
    var nro_cuota = cuota[0]["nro_cuota"]
    var id_lote = cuota[0]["id_lote"]


    try {
        let pago = cuota[0]["pago"] + pagot[0]["monto"]


        // Saldo_real = cuota[0]["saldo_inicial"] -saldo_realc  - pago 
        Saldo_real = saldo_realc - pago


        const update = {
            Saldo_real,
            pago,


        }

        await pool.query('UPDATE cuotas set  ? WHERE id = ?', [update, cuota[0]["id"]])
        cant_finales= await pool.query('select *from cuotas where   WHERE id_lote = ? and parcialidad = "Final"', [id_lote, ])
        console.log(cant_finales)
        if (nro_cuota === cant_finales.length ) {
        for (var i = nro_cuota+1; i <=cant_finales.length; i++) {
        
            try {//
                aux =  await pool.query('select *from cuotas where   WHERE id_lote = ? and nro_cuota=?', [id_lote, i])
                 saldo_realc =  aux[0]["Saldo_real"]
                 id =  aux[0]["id"] 
                 Saldo_real = saldo_realc - pago
                 const update = {
                    Saldo_real,
           
        
        
                }
                 await pool.query('UPDATE cuotas set  ? WHERE id = ?', [update, cuota[0]["id"]])
            } catch (error) {//
                
            }

         }}


        await pool.query('UPDATE pagos set estado = ? WHERE id = ?', ["A", id])
        res.send('Guardado correctamente')



        res.send('Exito')
    } catch (error) {

    }

})
///// inusuales mensuales react
router.post("/mensualesinusuales", async (req, res) => {
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
router.post("/rechazarr", async (req, res) => {
    const { id, detalle } = req.body
    console.log(id)
    console.log(detalle)
    const update ={
        estado:"R",

    }
   
    try {
        await pool.query('UPDATE pagos set  ? WHERE id = ?', [update, id])
       const aux = await pool.query('select * from  pagos  WHERE id = ?', [id])
       cuil_cuit = aux[0]['cuil_cuit']
       const update2 ={
        
        cuil_cuit: cuil_cuit,
        id_referencia: id,
        descripcion: detalle
    }
        await pool.query('INSERT INTO notificaciones set ?', [update2]);
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



