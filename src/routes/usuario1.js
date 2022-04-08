const express = require('express')
const router = express.Router()
const pool = require('../database')
const { isLoggedIn } = require('../lib/auth') //proteger profile
const XLSX = require('xlsx')

router.get('/', isLoggedIn, (req, res) => {
    res.render('usuario1/menu')

})


router.get("/cuotas", async (req, res) => {

    const cuotas = await pool.query('SELECT * FROM cuotas WHERE cuil_cuit = ?', [req.user.cuil_cuit])

    res.render('usuario1/listac', { cuotas })

})


router.get("/legajo", async (req, res) => {
    const razon = await pool.query('Select razon from users where cuil_cuit = ?', [req.user.cuil_cuit])
    if (razon[0]['razon'] == 'Empresa') {
        res.render('usuario1/datossociedad')
    } else { res.render('') }
})

router.get("/ingresos", async (req, res) => {
    const razon = await pool.query('Select razon from users where cuil_cuit = ?', [req.user.cuil_cuit])
    if (razon[0]['razon'] == 'Empresa') {
        res.render('usuario1/ingresose')
    } else { res.render('') }
})

router.get("/infocbu", async (req, res) => {
    const razon = await pool.query('Select razon from users where cuil_cuit = ?', [req.user.cuil_cuit])
    const cbu = await pool.query('select * from cbus where cuil_cuit=?', [req.user.cuil_cuit])
    if (razon[0]['razon'] == 'Empresa') {
        res.render('usuario1/infocbu', { cbu })
    } else { res.render('') }
})


router.get("/djs", async (req, res) => {
    const razon = await pool.query('Select razon from users where cuil_cuit = ?', [req.user.cuil_cuit])
    if (razon[0]['razon'] == 'Empresa') {
        res.render('usuario1/djse')
    } else { res.render('') }
})
router.get("/contacto", async (req, res) => {
    const razon = await pool.query('Select razon from users where cuil_cuit = ?', [req.user.cuil_cuit])
    if (razon[0]['razon'] == 'Empresa') {
        res.render('usuario1/contacto')
    } else { res.render('') }
})


router.get("/cbu", (req, res) => {
    res.render('usuario1/cbu')

})

router.get("/subir", (req, res) => {
    if (req.user.habilitado == 'SI') {
        res.render('usuario1/subir')
    } else { res.render('usuario1/subirno') }

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

    const { lazo, dc, numero, descripcion } = req.body;
    const cuil_cuit = req.user.cuil_cuit
    const estado = "P"
    const newcbu = {
        cuil_cuit,
        lazo,
        numero,
        descripcion,
        dc,
        estado
    }
    await pool.query('INSERT INTO cbus SET ?', [newcbu])

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
    const { comprobante } = req.body;
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
    req.flash('success', 'Guardado correctamente, tu solicitud sera procesada y se notificará al confirmarse')
    res.redirect(`/usuario1`);
})




router.post('/edit_comp_dni', async (req, res) => {
    const { comprobante } = req.body;
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
    req.flash('success', 'Guardado correctamente, tu solicitud sera procesada y se notificará al confirmarse')
    res.redirect(`/usuario1`);
})

router.post('/edit_comp_afip', async (req, res) => {
    const { comprobante } = req.body;
    const cuil_cuit = req.user.cuil_cuit
    const estado = "P"
    const tipo = "ConstAFIP"
    const id_cliente = req.user.id
    const newr = {
        id_cliente,
        cuil_cuit,
        comprobante,
        estado,
        tipo
    }
    await pool.query('INSERT INTO constancias SET ?', [newr])
    req.flash('success', 'Guardado correctamente, tu solicitud sera procesada y se notificará al confirmarse')
    res.redirect(`/usuario1`);
})


router.post('/edit_comp_domicilio', async (req, res) => {
    const { comprobante, descripcion } = req.body;
    const cuil_cuit = req.user.cuil_cuit
    const estado = "P"
    const tipo = "Domicilio"
    const id_cliente = req.user.id
    const newr = {
        id_cliente,
        cuil_cuit,
        comprobante,
        descripcion,
        estado,
        tipo
    }
    await pool.query('INSERT INTO constancias SET ?', [newr])
    req.flash('success', 'Guardado correctamente, tu solicitud sera procesada y se notificará al confirmarse')
    res.redirect(`/usuario1`);
})

router.post('/edit_comp_estatuto', async (req, res) => {
    const { comprobante } = req.body;
    const cuil_cuit = req.user.cuil_cuit
    const estado = "P"
    const tipo = "Estatuto"
    const id_cliente = req.user.id
    const newr = {
        id_cliente,
        cuil_cuit,
        comprobante,
        estado,
        tipo
    }
    await pool.query('INSERT INTO constancias SET ?', [newr])
    req.flash('success', 'Guardado correctamente, tu solicitud sera procesada y se notificará al confirmarse')
    res.redirect(`/usuario1`);
})


router.post('/edit_comp_acta', async (req, res) => {
    const { comprobante } = req.body;
    const cuil_cuit = req.user.cuil_cuit
    const estado = "P"
    const tipo = "Actaorgano"
    const id_cliente = req.user.id
    const newr = {
        id_cliente,
        cuil_cuit,
        comprobante,
        estado,
        tipo
    }
    await pool.query('INSERT INTO constancias SET ?', [newr])
    req.flash('success', 'Guardado correctamente, tu solicitud sera procesada y se notificará al confirmarse')
    res.redirect(`/usuario1`);
})


router.post('/edit_comp_balance', async (req, res) => {
    const { comprobante, comprobante2 } = req.body;
    console.log(comprobante)

    if ((comprobante.length == 0) || (comprobante2.length == 0)) {
        req.flash('message', 'Error, se deben subir 2 ')
        res.redirect(`/usuario1/ingresos`)
    } else {

        const cuil_cuit = req.user.cuil_cuit
        const estado = "P"
        const tipo = "Balance"
        const id_cliente = req.user.id
        const newr = {
            id_cliente,
            cuil_cuit,
            comprobante,
            comprobante2,
            estado,
            tipo
        }

        await pool.query('INSERT INTO constancias SET ?', [newr])
        req.flash('success', 'Guardado correctamente, tu solicitud sera procesada y se notificará al confirmarse')
        res.redirect(`/usuario1`);
    }
})

router.post('/edit_comp_djiva', async (req, res) => {
    const { comprobante, comprobante2, comprobante3 } = req.body;
    console.log(comprobante)

    if ((comprobante.length == 0) || (comprobante2.length == 0) || (comprobante3.length == 0))  {
        req.flash('message', 'Error, se deben subir 3 ')
        res.redirect(`/usuario1/ingresos`)
    } else {
       
        const cuil_cuit = req.user.cuil_cuit
        const estado = "P"
        const tipo = "DjIVA"
        const id_cliente = req.user.id
        const newr = {
            id_cliente,
            cuil_cuit,
            comprobante,
            comprobante2,
            comprobante3,
            estado,
            tipo,
        }
        await pool.query('INSERT INTO constancias SET ?', [newr])
        req.flash('success', 'Guardado correctamente, tu solicitud sera procesada y se notificará al confirmarse')
        res.redirect(`/usuario1/`);
    }
})


router.post('/edit_comp_djpagosprov', async (req, res) => {
    const { comprobante, comprobante2, comprobante3 } = req.body;

    if ((comprobante.length == 0) || (comprobante2.length == 0) || (comprobante3.length == 0)) {
        req.flash('message', 'Error, se deben subir 3 ')
        res.redirect(`/usuario1`)
    }else {
        const cuil_cuit = req.user.cuil_cuit
        const estado = "P"
        const tipo = "Djprovision"
        const id_cliente = req.user.id
        const newr = {
            id_cliente,
            cuil_cuit,
            comprobante,
            comprobante2,
            comprobante3,
            estado,
            tipo,
        }
        await pool.query('INSERT INTO constancias SET ?', [newr])
        req.flash('success', 'Guardado correctamente, tu solicitud sera procesada y se notificará al confirmarse')
        res.redirect(`/usuario1`);
    } 
})


router.post('/edit_comp_djdatospers', async (req, res) => {
    const { comprobante } = req.body;
    const cuil_cuit = req.user.cuil_cuit
    const estado = "P"
    const tipo = "djdatospers"
    const id_cliente = req.user.id
    const newr = {
        id_cliente,
        cuil_cuit,
        comprobante,
        estado,
        tipo
    }
    await pool.query('INSERT INTO constancias SET ?', [newr])
    req.flash('success', 'Guardado correctamente, tu solicitud sera procesada y se notificará al confirmarse')
    res.redirect(`/usuario1`);
})


router.post('/edit_comp_djcalidadpers', async (req, res) => {
    const { comprobante } = req.body;
    const cuil_cuit = req.user.cuil_cuit
    const estado = "P"
    const tipo = "djcalidadpers"
    const id_cliente = req.user.id
    const newr = {
        id_cliente,
        cuil_cuit,
        comprobante,
        estado,
        tipo
    }
    await pool.query('INSERT INTO constancias SET ?', [newr])
    req.flash('success', 'Guardado correctamente, tu solicitud sera procesada y se notificará al confirmarse')
    res.redirect(`/usuario1`);
})


router.post('/edit_comp_jdorigen', async (req, res) => {
    const { comprobante } = req.body;
    const cuil_cuit = req.user.cuil_cuit
    const estado = "P"
    const tipo = "djorigen"
    const id_cliente = req.user.id
    const newr = {
        id_cliente,
        cuil_cuit,
        comprobante,
        estado,
        tipo
    }
    await pool.query('INSERT INTO constancias SET ?', [newr])
    req.flash('success', 'Guardado correctamente, tu solicitud sera procesada y se notificará al confirmarse')
    res.redirect(`/usuario1`);
})

module.exports = router

