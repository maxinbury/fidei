const express = require('express')
const router = express.Router()
const pool = require('../database')
const { isLevel2 } = require('../lib/authnivel2')
const { isLoggedIn } = require('../lib/auth') //proteger profile





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
    try {
        let pago = cuota[0]["pago"] + pagot[0]["monto"]


        // Saldo_real = cuota[0]["saldo_inicial"] -saldo_realc  - pago 
        Saldo_real = saldo_realc - pago
    
    
        const update = {
            Saldo_real,
            pago,
        
    
        }
    
        await pool.query('UPDATE cuotas set  ? WHERE id = ?', [update, cuota[0]["id"]])
    
    
    
    
        await pool.query('UPDATE pagos set estado = ? WHERE id = ?', ["A", id])
        res.send('Guardado correctamente')
    
    
    
        res.send('Exito')
    } catch (error) {
        
    }
   
})


////////rechazar 
router.post("/rechazarr", async (req, res) => {
  const   {id, detalle} = req.body
  console.log(id)
  console.log(detalle)
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



