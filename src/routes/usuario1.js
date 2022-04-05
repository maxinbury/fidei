const express = require('express')
const router = express.Router()
const pool = require('../database')
const { isLoggedIn } = require('../lib/auth') //proteger profile
const XLSX = require('xlsx')

router.get('/', isLoggedIn, (req, res) => {
    res.render('usuario1/menu')

})

router.get("/cuotas", async (req, res) => {

    const cuotas = await pool.query('SELECT * FROM cuotas WHERE dni = ?', [req.user.dni])
    console.log(cuotas)
    res.render('usuario1/listac', { cuotas })

})


router.get("/edit", (req, res) => {
    res.render('usuario1/edit')

})

router.get("/cbu", (req, res) => {
    res.render('usuario1/cbu')

})

router.get("/subir", (req, res) => {
    if (req.user.habilitado == 'SI'){
        res.render('usuario1/subir')
    }else {res.render('usuario1/subirno')}

})

/* ORIGINAL
router.get("/subir", (req, res) => {
    res.render('usuario1/subir')

})
*/
router.post('/realizar', async (req, res) => {
    const { monto, comprobante } = req.body;
    const dni = req.user.dni
    var estado = 'P'

    const workbook = XLSX.readFile('./src/Excel/cuentas_PosicionConsolidada.xls')
    const workbooksheets = workbook.SheetNames
    const sheet = workbooksheets[0]

    const dataExcel = XLSX.utils.sheet_to_json(workbook.Sheets[sheet])
    //console.log(dataExcel)

    const palabra = 'LEY'
    console.log(palabra.includes('LEY'))

    for (const property in dataExcel) {
        if ((dataExcel[property]['Descripción']).includes(dni)) {
            estado = 'A'
        }

    }

    const newLink = {
        monto,
        dni,
        estado,
        comprobante
    };
    await pool.query('INSERT INTO pagos SET ?', [newLink]);
    req.flash('success', 'Guardado correctamente, tu solicitud sera procesada y se notificará al confirmarse')
    res.redirect(`/usuario1`);

})

router.post('/addcbu', async (req, res) => {

    const { lazo, dc, numero } = req.body;
    const cuil_cuit = req.user.cuil_cuit
    const estado = "P"
    const newcbu = {
        cuil_cuit,
        lazo,
        numero,
        dc,
        estado
    }
    await pool.query('INSERT INTO cbu SET ?', [newcbu])
    
    req.flash('success', 'Guardado correctamente, tu solicitud sera procesada y se notificará al confirmarse')
    res.redirect(`/usuario1`);
})


router.post('/edit_tel', async (req, res) => {
    const { tel } = req.body;
    const newLink = {
        tel
    }
    const id = req.user.id
    console.log(id)
    await pool.query("UPDATE users SET ? WHERE id = ?", [newLink, id])
    req.flash('success', 'Guardado correctamente')
    res.redirect(`/usuario1`)
})

router.post('/edit_correo', async (req, res) => {
    const { correo } = req.body;
    const newLink = {
        correo
    }
    const id = req.user.id

    await pool.query('UPDATE users set ? WHERE id = ?', [newLink, id])
    req.flash('success', 'Guardado correctamente')
    res.redirect(`/usuario1`);
})



router.post('/edit_comp_recibo', async (req, res) => {
    const {  comprobante } = req.body;
    console.log(comprobante)
    const cuil_cuit = req.user.cuil_cuit
    const estado = "P"
    const tipo = "Recibo_sueldo"
    const id_cliente = req.user.id
    const newr = {
        id_cliente,
        cuil_cuit,
        comprobante,
        estado,
        tipo
    }
    await pool.query('INSERT INTO constancias SET ?', [newr])
    await pool.query("UPDATE users SET habilitado = 'NO' WHERE id = ?",[req.user.id])
    req.flash('success', 'Guardado correctamente, tu solicitud sera procesada y se notificará al confirmarse')
    res.redirect(`/usuario1`);
})




router.post('/edit_comp_dni', async (req, res) => {
    const {  comprobante } = req.body;
    const cuil_cuit = req.user.cuil_cuit
    const estado = "P"
    const tipo = "Dni"
    const id_cliente = req.user.id
    const newr = {
        id_cliente,
        cuil_cuit,
        comprobante,
        estado,
        tipo
    }
    await pool.query('INSERT INTO constancias SET ?', [newr])
    await pool.query("UPDATE users SET habilitado = 'NO' WHERE id = ?",[req.user.id])
    req.flash('success', 'Guardado correctamente, tu solicitud sera procesada y se notificará al confirmarse')
    res.redirect(`/usuario1`);
})

module.exports = router

