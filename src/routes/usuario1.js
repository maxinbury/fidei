const express = require('express')
const router = express.Router()
const pool = require('../database')
const { isLoggedIn } = require('../lib/auth') //proteger profile
const XLSX = require('xlsx')

router.get('/', isLoggedIn, async (req, res) => {


    const habilitado = await pool.query('select habilitado from users where cuil_cuit=? ', [req.user.cuil_cuit])
    const habil = pool.query('Select * from users where cuil_cuit= ? and habilitado ="SI"', [req.user.cuil_cuit])

    if (habilitado[0]['habilitado'] = 'NO') {
        var Recibo_sueldo = await pool.query('select * from constancias where cuil_cuit = ? and tipo = "Recibo_sueldo" and estado="A" ', [req.user.cuil_cuit])

        var Dni = await pool.query('select * from constancias where cuil_cuit = ? and tipo = "Dni" and estado="A" ', [req.user.cuil_cuit])
        var ConstAFIP = await pool.query('select * from constancias where cuil_cuit = ? and tipo = "ConstAFIP" and estado="A" ', [req.user.cuil_cuit])
        var Domicilio = await pool.query('select * from constancias where cuil_cuit = ? and tipo = "Domicilio" and estado="A" ', [req.user.cuil_cuit])
        var Estatuto = await pool.query('select * from constancias where cuil_cuit = ? and tipo = "Estatuto" and estado="A" ', [req.user.cuil_cuit])
        var Actaorgano = await pool.query('select * from constancias where cuil_cuit = ? and tipo = "Actaorgano" and estado="A" ', [req.user.cuil_cuit])
        var Balance = await pool.query('select * from constancias where cuil_cuit = ? and tipo = "Balance" and estado="A" ', [req.user.cuil_cuit])
        var DjIVA = await pool.query('select * from constancias where cuil_cuit = ? and tipo = "DjIVA" and estado="A" ', [req.user.cuil_cuit])
        var Djprovision = await pool.query('select * from constancias where cuil_cuit = ? and tipo = "Djprovision" and estado="A" ', [req.user.cuil_cuit])
        var djdatospers = await pool.query('select * from constancias where cuil_cuit = ? and tipo = "djdatospers" and estado="A" ', [req.user.cuil_cuit])
        var djcalidadpers = await pool.query('select * from constancias where cuil_cuit = ? and tipo = "djcalidadpers" and estado="A" ', [req.user.cuil_cuit])
        var djorigen = await pool.query('select * from constancias where cuil_cuit = ? and tipo = "djorigen" and estado="A" ', [req.user.cuil_cuit])

        var habilitar = true
        if (Recibo_sueldo.length == 0) {
            Recibo_sueldo = 'Recibo de sueldoo'
            habilitar = false
        } else { Recibo_sueldo = '' }
        if (Dni.length == 0) {
            Dni = 'Foto de DNI'
            habilitar = false
        } else { Dni = '' }
        if (ConstAFIP.length == 0) {
            ConstAFIP = 'Constancia de la Afip'
            habilitar = false
        } else { ConstAFIP = '' }
        if (Domicilio.length == 0) {
            Domicilio = 'Certificado de domicilio'
            habilitar = false
        } else { Domicilio = '' }
        if (Estatuto.length == 0) {
            Estatuto = 'Estatuto'
            habilitar = false
        } else { Estatuto = '' }
        if (Actaorgano.length == 0) {
            Actaorgano = 'Acta de organo'
            habilitar = false
        } else { Actaorgano = '' }
        if (Balance.length == 0) {
            Balance = 'Balance'
            habilitar = false
        } else { Balance = '' }
        if (DjIVA.length == 0) {
            DjIVA = 'Dj IVA'
            habilitar = false
        } else { DjIVA = '' }
        if (Djprovision.length == 0) {
            Djprovision = 'Djprovision'
            habilitar = false
        } else { Djprovision = '' }
        if (djdatospers.length == 0) {
            djdatospers = 'DJ datos personales'
            habilitar = false
        } else { djdatospers = '' }
        if (djcalidadpers.length == 0) {
            djcalidadpers = 'DJ Calidad persona'
            habilitar = false
        } else { djcalidadpers = '' }
        if (djorigen.length == 0) {
            djorigen = 'DJ Origen de fondos '
            habilitar = false
        } else { djorigen = '' }
        if (habilitar) {
            await pool.query('UPDATE `fideicomiso`.`users` SET `habilitado` = "SI" WHERE (`id` = ?)', [req.user.cuil_cuit])
        }
        const faltantes = { habil, Dni, ConstAFIP, Domicilio, Estatuto, Actaorgano, Balance, DjIVA, Djprovision, djdatospers, djorigen }

        res.render('usuario1/menu', { faltantes })


    } else {
        const algo = 'algoo'

        res.render('usuario1/menu', { algo })
    }


})



router.get('/leer/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params


    const noti = await pool.query('SELECT * FROM notificaciones where id = ?', [id])





    if (noti[0] != "Si") {
        await pool.query('UPDATE notificaciones SET leida="Si"  where id = ?', [id])

    }

    res.render('usuario1/leer', { noti })
})



router.get("/cuotas", async (req, res) => {

    const cuotas = await pool.query('SELECT * FROM cuotas WHERE cuil_cuit = ?', [req.user.cuil_cuit])

    res.render('usuario1/listacuotas', { cuotas })

})

router.get("/pagos", async (req, res) => {


    const pagos = await pool.query('SELECT * FROM pagos WHERE cuil_cuit = ? ', [req.user.cuil_cuit])

 



    res.render('usuario1/pagos', { pagos })

})

router.get("/estado", async (req, res) => {

    const cuotas = await pool.query('SELECT * FROM cuotas WHERE cuil_cuit = ? ', [req.user.cuil_cuit])
    var devengado = 0
    var pagado
    for (var i = 0; i < cuotas.length; i++) {
        if (cuotas[i]['parcialidad'] !='Final') {
            devengado+= cuotas[i]['parcialidad']
        }
        ;
    }
    const pagos = await pool.query('SELECT * FROM pagos WHERE cuil_cuit = ? ', [req.user.cuil_cuit])

    for (var i = 0; i < pagos.length; i++) {
        
            pagado+= pagos[i]['monto']
        
        ;
    }
    const total  ={
        pagado,
        devengado

    }

    res.render('usuario1/listacuotasamp', { total })

})



router.get("/cuotasamp", async (req, res) => {

    const cuotas = await pool.query('SELECT * FROM cuotas WHERE cuil_cuit = ?', [req.user.cuil_cuit])

    res.render('usuario1/listacuotasamp', { cuotas })

})

router.get("/notificaciones", async (req, res) => {

    const notificaciones = await pool.query('SELECT * FROM notificaciones WHERE cuil_cuit = ?', [req.user.cuil_cuit])

    res.render('usuario1/notificaciones', { notificaciones })

})


router.get("/menu2", async (req, res) => {



    res.render('usuario1/menu2/index')

})



router.get("/legajo", async (req, res) => {
    const razon = await pool.query('Select razon from users where cuil_cuit = ?', [req.user.cuil_cuit])
    if (razon[0]['razon'] == 'Empresa') {
        res.render('usuario1/datossociedad')
    } else { res.render('usuario1/datospers') }
})

router.get("/ingresos", async (req, res) => {
    const razon = await pool.query('Select razon from users where cuil_cuit = ?', [req.user.cuil_cuit])
    if (razon[0]['razon'] == 'Empresa') {
        res.render('usuario1/ingresose')
    } else { res.render('usuario1/ingresosp') }
})

router.get("/infocbu", async (req, res) => {
    const razon = await pool.query('Select razon from users where cuil_cuit = ?', [req.user.cuil_cuit])
    const cbu = await pool.query('select * from cbus where cuil_cuit=?', [req.user.cuil_cuit])
    if (razon[0]['razon'] == 'Empresa') {
        res.render('usuario1/infocbu', { cbu })
    } else { res.render('usuario1/infocbup') }
})


router.get("/djs", async (req, res) => {
    const razon = await pool.query('Select razon from users where cuil_cuit = ?', [req.user.cuil_cuit])
    if (razon[0]['razon'] == 'Empresa') {
        res.render('usuario1/djse')
    } else { res.render('usuario1/djsp') }
})

router.get("/contacto", async (req, res) => {
    const razon = await pool.query('Select razon from users where cuil_cuit = ?', [req.user.cuil_cuit])
    if (razon[0]['razon'] == 'Empresa') {
        res.render('usuario1/contacto')
    } else { res.render('usuario1/contactop') }
})


router.get("/cbu", (req, res) => {
    res.render('usuario1/cbu')

})

router.get("/subir", isLoggedIn, (req, res) => {
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
    const { monto, comprobante, mes, anio } = req.body;
    const cuil_cuit = req.user.cuil_cuit
    var estado = 'P'
    /*  const workbook = XLSX.readFile('./src/Excel/cuentas_PosicionConsolidada.xls')
     const workbooksheets = workbook.SheetNames
     const sheet = workbooksheets[0]
 
     const dataExcel = XLSX.utils.sheet_to_json(workbook.Sheets[sheet])
     //console.log(dataExcel)
 
     const palabra = 'LEY'
     console.log(palabra.includes('LEY'))
 
     for (const property in dataExcel) {
         if ((dataExcel[property]['Descripción']).includes(cuil_cuit)) {
             estado = 'A'
         }
     }
  */

    const existe = await pool.query('Select * from cuotas where cuil_cuit=? and mes = ? and anio =?  and parcialidad = "Final"', [cuil_cuit, mes, anio])

    if (existe.length > 0) {

        const id_cuota = existe[0]["id"]
        const newLink = {
            id_cuota,
            monto,
            cuil_cuit,
            estado,
            comprobante,
            mes,
            anio
        };
        await pool.query('INSERT INTO pagos SET ?', [newLink]);
        req.flash('success', 'Guardado correctamente, tu solicitud sera procesada y se notificará al confirmarse')
        res.redirect(`/usuario1`);
    } else {
        req.flash('message', 'Error la cuota no existe')
        res.redirect(`/usuario1/subir`)

    }

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


    if (comprobante.length > 0) {

        const newLink = {
            correo
        }
        const id = req.user.id

        await pool.query('UPDATE users set ? WHERE id = ?', [newLink, id])
        req.flash('success', 'Guardado correctamente')
        res.redirect(`/usuario1`);


    } else {
        req.flash('message', 'Error, Tienes que ingresar un mail ')
        res.redirect('/usuario1/legajo')
    }



})

//VER
router.post('/edit_comp_recibo', async (req, res) => {
    const { comprobante } = req.body;
    console.log(comprobante)

    if (comprobante.length > 0) {

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


    } else {
        req.flash('message', 'Error, Tienes que subir un comprobante ')
        res.redirect('/usuario1/legajo')
    }


})




router.post('/edit_comp_dni', async (req, res) => {
    const { comprobante } = req.body;
    if (comprobante.length > 0) {
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
        res.redirect(`/usuario1/legajo`);



    } else {
        req.flash('message', 'Error, Tienes que subir un comprobante ')
        res.redirect('/usuario1/legajo')
    }




})

router.post('/edit_comp_afip', async (req, res) => {
    const { comprobante } = req.body;

    if (comprobante.length > 0) {
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

    } else {
        req.flash('message', 'Error, Tienes que subir un comprobante ')
        res.redirect('/usuario1/legajo')
    }


})


router.post('/edit_comp_domicilio', async (req, res) => {
    const { comprobante, descripcion } = req.body;

    if (comprobante.length > 0 || descripcion.length > 0) {
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


    } else {
        req.flash('message', 'Error, Tienes que subir un comprobante ')
        res.redirect('/usuario1/legajo')
    }



})

router.post('/edit_comp_estatuto', async (req, res) => {
    const { comprobante } = req.body;

    if (comprobante.length > 0) {
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

    } else {
        req.flash('message', 'Error, Tienes que subir un comprobante ')
        res.redirect('/usuario1/legajo')
    }


})


router.post('/edit_comp_acta', async (req, res) => {
    const { comprobante } = req.body;


    if (comprobante.length > 0) {
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


    } else {
        req.flash('message', 'Error, Tienes que subir un comprobante ')
        res.redirect('/usuario1/legajo')
    }



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

    if ((comprobante.length == 0) || (comprobante2.length == 0) || (comprobante3.length == 0)) {
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
    } else {
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

    if (comprobante.length > 0) {
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


    } else {
        req.flash('message', 'Error, Tienes que subir un comprobante ')
        res.redirect('/usuario1/legajo')
    }


})


router.post('/edit_comp_djcalidadpers', async (req, res) => {
    const { comprobante } = req.body;


    if (comprobante.length > 0) {


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


    } else {
        req.flash('message', 'Error, Tienes que subir un comprobante ')
        res.redirect('/usuario1/legajo')
    }



})


router.post('/edit_comp_jdorigen', async (req, res) => {
    const { comprobante } = req.body;


    if (comprobante.length > 0) {

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


    } else {
        req.flash('message', 'Error, Tienes que subir un comprobante ')
        res.redirect('/usuario1/legajo')
    }


})




router.post('/edit_const_cuil', async (req, res) => {
    const { comprobante } = req.body;


    if (comprobante.length > 0) {

        const cuil_cuit = req.user.cuil_cuit
        const estado = "P"
        const tipo = "const_cuil"
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


    } else {
        req.flash('message', 'Error, Tienes que subir un comprobante ')
        res.redirect('/usuario1/legajo')
    }



})









module.exports = router

