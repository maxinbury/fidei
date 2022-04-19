const express = require('express')
const router = express.Router()
const pool = require('../database')
const { isLevel2 } = require('../lib/authnivel2')
const { isLoggedIn } = require('../lib/auth') //proteger profile

router.get("/cuotas/:cuil_cuit", isLoggedIn, async (req, res) => {
    const cuil_cuit = req.params.cuil_cuit
    const cuotas = await pool.query('SELECT * FROM cuotas WHERE cuil_cuit = ?', [cuil_cuit])
    res.render('cuotas/lista', { cuotas })
})

router.get("/", isLevel2, isLoggedIn, async (req, res) => {
    const cuotas = await pool.query('SELECT * FROM cuotas ')
    res.render('cuotas/lista', { cuotas })
})

router.get("/ampliar", isLevel2, isLoggedIn, async (req, res) => {
    const cuotas = await pool.query('SELECT * FROM cuotas ')
    res.render('cuotas/listaamp', { cuotas })
})

router.get('/add', isLoggedIn, (req, res) => {
    res.render('cuotas/add')

})

router.post('/add', async (req, res) => {
    const { saldo_inicial, saldo_cierre, cuil_cuit } = req.body;
    const newLink = {
        saldo_inicial,
        saldo_cierre,
        cuil_cuit
    };

    await pool.query('INSERT INTO cuotas SET ?', [newLink]);

    req.flash('success', 'Guardado correctamente')
    res.redirect('/cuotas');


})

router.post('/addaut', async (req, res) => {
    const { cuil_cuit, monto_total, cantidad_cuotas, lote } = req.body;
    const monto_cuota = monto_total / cantidad_cuotas;
    var nro_cuota = 1
    var saldo_inicial = monto_total
    const row = await pool.query('SELECT * from clientes where cuil_cuit = ?', [req.body.cuil_cuit])
    if (row.length > 0) {
        var saldo_cierre = saldo_inicial - monto_cuota
        const id_cliente = row[0].id

        for (var i = 1; i <= cantidad_cuotas; i++) {
            nro_cuota = i
            const newLink = {
                nro_cuota,
                saldo_inicial,
                saldo_cierre,
                cuil_cuit,
                id_cliente,
                lote
            
            };

            await pool.query('INSERT INTO cuotas SET ?', [newLink]);

            saldo_inicial -= monto_cuota
            saldo_cierre = saldo_inicial - monto_cuota
        } req.flash('success', 'Guardado correctamente')
        res.redirect('/cuotas')
    }

    else {
        req.flash('message', 'Error cliente no existe')
        res.redirect('/cuotas/add')
    }
})


router.get("/edit/:id", isLoggedIn, async (req, res) => {
    const id = req.params.id
    const cuotas = await pool.query('SELECT * FROM cuotas WHERE id = ?', [id])
    res.render('cuotas/edit', { cuotas })
})



router.post('/editar', async (req, res, next) => {
    const { saldo_inicial, Amortizacion, Base_calculo, ICC, Ajuste_ICC ,cuota_con_ajuste , saldo_cierre, id } = req.body;
        console.log(Amortizacion)
        console.log(ICC)
    const cuota = {
        saldo_inicial,
        Amortizacion,
        Base_calculo,
        ICC,
        Ajuste_ICC,
        cuota_con_ajuste,
        saldo_cierre
    }

    await pool.query('UPDATE cuotas set ? WHERE id = ?', [cuota, id])
    req.flash('success', 'Guardado correctamente')
    res.redirect(`/cuotas`);
})



router.get('/delete/:id', async (req, res) => {
    const { id } = req.params
    await pool.query('DELETE FROM cuotas WHERE ID = ?', [id])
    req.flash('success', 'Cuotas eliminadas')
    res.redirect('/cuotas')
})

//-----

router.post('/cuotas', async (req, res, next) => {
    const { id } = req.body
    const rows = await pool.query('SELECT * FROM cuotas WHERE id_cliente = ?', [id])
    console.log(id)
    if (rows.length > 0) {
        res.redirect(`../cuotas/${id}`)


    } else { res.redirect('clientes') }

})
module.exports = router


