const express = require('express')
const router = express.Router()
const pool = require('../database')
const { isLevel2 } = require('../lib/authnivel2')
const { isLoggedIn } = require('../lib/auth') //proteger profile

const { isLevel3 } = require('../lib/authnivel3')
const { lista, ampliar, add_cliente, postadd, postaddaut, quelote, lote, cuotascli, edit_c } = require('../contoladores/cuotascontrolador')

require('../contoladores/cuotascontrolador')

//



//LISTADO DE TODAS LAS CUOTAS ------------- no esta conectado

router.get("/lista", isLevel2, isLoggedIn,lista )



//LISTADO AMPLIO DE TODAS LAS CUOTAS
router.get("/ampliar/:cuil_cuit", isLevel2, isLoggedIn, ampliar)


//--------INICIO AGREGAR CUOTAS---------------------------------------------------------------------------


//PAGINA DE AGREGAR CUOTAS UNA O VARIAS 
router.get('/add/cliente/:id', isLoggedIn, add_cliente)

// AGREGAR UNA SOLA CUOTA 
router.post('/add', postadd)


// AGREGA VARIAS CUOTAS 
router.post('/addaut', postaddaut)



//--------FIN AGREGAR CUOTAS----------------------------------------------------------------------------
// elegir lote

router.get("/quelote/:cuil_cuit", isLoggedIn, isLevel2, quelote)

// LISTADO DE CUOTAS DE UN lote DETERMINADO 

router.get("/lote/:id", isLoggedIn, isLevel2, lote)
   





// LISTADO DE CUOTAS DE UN CUIL DETERMINADO 
//desconectamos 
router.get("/cuotas/:cuil_cuit", isLoggedIn, isLevel2, cuotascli)






// PAGINA DE EDITAR CLIENTE    **NO PROBADO 
router.get("/edit/:id", isLoggedIn, edit_c)


//-------------------------------------------------------------------------AGREGAR ICC
// AGREGAR ICC DE UN SOLO CLIENTE
router.get("/agregar_icc/:id", isLoggedIn, async (req, res) => {
    const id = req.params.id
    const cuotas = await pool.query('SELECT * FROM cuotas WHERE id = ?', [id])
    res.render('cuotas/agregaricc', { cuotas })
})
// ACCION DE  AGREGAR ICC
router.post('/agregaricc', async (req, res,) => {
    const { id, ICC, nro_cuota, cuil_cuit, Amortizacion } = req.body;
    const cuotaa = await pool.query("select * from cuotas where id = ? ", [id])

    const parcialidad = "Final"
    if (nro_cuota == 1) {
        saldo_inicial = cuotaa[0]["saldo_inicial"]
        const Ajuste_ICC = 0
        const Base_calculo = Amortizacion
        const cuota_con_ajuste = Amortizacion
        const Saldo_real = saldo_inicial


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

        var Saldo_real_anterior = anterior[0]["Saldo_real"]

        const cuota_con_ajuste_anterior = anterior[0]["cuota_con_ajuste"]

        const Base_calculo = cuota_con_ajuste_anterior
        const Ajuste_ICC = cuota_con_ajuste_anterior * ICC

        const cuota_con_ajuste = cuota_con_ajuste_anterior + Ajuste_ICC
        Saldo_real_anterior += Ajuste_ICC
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
    await pool.query('UPDATE cuotas set ? WHERE id = ?', [cuota, id])
    res.redirect(`/cuotas/cuotas/`+cuil_cuit);



})





// redireccion a lotes del cliente 
router.get("/lotes/:cuil_cuit", isLoggedIn, async (req, res) => {
    const cuil_cuit = req.params.cuil_cuit

    res.render('cuotas/lotes')
})


//-------------------------------------------------------------------------FIN  AGREGAR ICC---------------------------------------






/* 

original
router.post('/editarr', async (req, res, ) => {
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
 */


//-----Borar Cuota
router.get('/delete/:id', async (req, res) => {
    const { id } = req.params
    try {
        console.log(id)
        let aux = await pool.query('select * from cuotas where id =?',[id])
        console.log(aux)
        cuil_cuit = aux[0]['cuil_cuit']
        await pool.query('DELETE FROM cuotas WHERE id = ?', [id])
        req.flash('success', 'Cuota eliminadas')
    } catch (error) {
    
    }
  


    res.redirect('/cuotas/cuotas/'+cuil_cuit)
})


//----- Ver... no esta enchufado

router.post('/cuotas', async (req, res, next) => {
    const { id } = req.body
    const rows = await pool.query('SELECT * FROM cuotas WHERE id_cliente = ?', [id])
    c
    if (rows.length > 0) {
        res.redirect(`../cuotas/${id}`)


    } else { res.redirect('clientes') }

})

//PRUEBA
router.post('/prueba', async (req, res,) => {
    const { saldo_inicial, Amortizacion, Base_calculo, ICC, Ajuste_ICC, cuota_con_ajuste, saldo_cierre, id } = req.body;

}

    /* const cuota = {
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
    res.redirect(`/cuotas`);} */
)









module.exports = router


