const express = require('express')
const router = express.Router()
const pool = require('../database')
const { isLevel2 } = require('../lib/authnivel2')
const { isLoggedIn,isLoggedInn2  } = require('../lib/auth') //proteger profile

const { isLevel3 } = require('../lib/authnivel3')
const { lista,addautvarias, ampliar, add_cliente, cuotasdeunlote, postadd, postaddaut2, postaddaut, quelote, lotefuncion, lotefuncion2, cuotascli, edit_c, agregar_icc, post_agregaricc, lotes } = require('../contoladores/cuotascontrolador')

require('../contoladores/cuotascontrolador')

//



//LISTADO DE TODAS LAS CUOTAS ------------- no esta conectado

router.get("/lista", isLevel2, isLoggedIn, lista)



//LISTADO AMPLIO DE TODAS LAS CUOTAS
router.get("/ampliar/:cuil_cuit", isLevel2, isLoggedIn, ampliar)


//--------INICIO AGREGAR CUOTAS---------------------------------------------------------------------------


//PAGINA DE AGREGAR CUOTAS UNA O VARIAS 
router.get('/add/cliente/:id', isLoggedIn, add_cliente)

// AGREGAR UNA SOLA CUOTA 
router.post('/add', isLevel2, postadd)


// AGREGA VARIAS CUOTAS 
router.post('/addaut', postaddaut)
router.post('/addaut2',isLoggedInn2, postaddaut2)
router.post('/addautvarias',isLoggedInn2, addautvarias)


/// cuotasdeunloteReact
router.get("/cuotasdeunlote/:id",isLoggedInn2, cuotasdeunlote)



//--------FIN AGREGAR CUOTAS----------------------------------------------------------------------------
// elegir lote

router.get("/quelote/:cuil_cuit", isLoggedIn, isLevel2, quelote)

// LISTADO DE CUOTAS DE UN lote DETERMINADO 

router.get("/lote/:id", lotefuncion)
// auxililar react
router.get("/lote2/:id",isLoggedInn2, lotefuncion2)


//async (req, res) => {console.log(req.params.id)}



// LISTADO DE CUOTAS DE UN CUIL DETERMINADO 
//desconectamos 
router.get("/cuotas/:cuil_cuit", isLoggedIn, isLevel2, cuotascli)






// PAGINA DE EDITAR CLIENTE    **NO PROBADO 
router.get("/edit/:id", isLoggedIn, isLevel2, edit_c)


//-------------------------------------------------------------------------AGREGAR ICC
// AGREGAR ICC DE UN SOLO CLIENTE
router.get("/agregar_icc/:id", isLoggedIn, isLevel2, agregar_icc)


// ACCION DE  AGREGAR ICC  REACT
router.post('/agregaricc', isLoggedInn2, post_agregaricc)





// redireccion a lotes del cliente 
router.get("/lotes/:cuil_cuit", isLoggedIn, lotes)



//////////asignar a lotes cuadro decuotasexistente
router.post('/asignarloteacuotas', async (req, res, next) => {
    const { id, id_origen } = req.body
    
    
    console.log(id)
    console.log(id_origen)

    datos = {idcuotas:id}
    await pool.query('UPDATE lotes set ? WHERE id = ?', [datos, id_origen])


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



router.get('/traercuotaselcliente/:id', isLoggedInn2, async (req, res) => {
const { id } = req.params
console.log(id)
lote = await pool.query ('select * from lotes where id = ?',[id])
console.log(lote[0]['cuil_cuit'])

todos = await pool.query ('select DISTINCT id_lote, zona, manzana, parcela  from cuotas where cuil_cuit = ?',[lote[0]['cuil_cuit']])
console.log(todos)
res.json(todos)

})
    

router.get('/listavarios/:cuil_cuit', isLoggedInn2, async (req, res) => {
    const { cuil_cuit } = req.params
    try {
        
        lotess = await pool.query('select * from lotes where cuil_cuit = ? ',[cuil_cuit])
        console.log(lotess)
        let valor = {}
        try {
            valormetro = await pool.query('select * from nivel3 where valormetroparque = "PIT" order by id')
            valorparque = valormetro[(valormetro.length - 1)]['valormetrocuadrado']
            valormetro = await pool.query('select * from nivel3 where valormetroparque = "IC3" order by id')
            valorotro =valormetro[(valormetro.length - 1)]['valormetrocuadrado']
    
            valor = {
                valorparque,
                valorotro
            }
        } catch (error) {
            
        }
      

        res.json([lotess,valor])
    } catch (error) {
        res.send('Error algo sucedio')
    }




})


router.get('/delete/:id', isLoggedInn2, async (req, res) => {
    const { id } = req.params
    try {

        await pool.query('DELETE FROM cuotas WHERE id = ?', [id])
        res.send('Cuota eliminada')
    } catch (error) {
        res.send('Error algo sucedio')
    }




})


//----- Ver... no esta enchufado

router.post('/cuotas', async (req, res, next) => {
    const { id } = req.body
    const rows = await pool.query('SELECT * FROM cuotas WHERE id_cliente = ?', [id])
    cartodas
    if (rows.length > 0) {
        res.redirect(`../cuotas/${id}`)


    } else { res.redirect('clientes') }

})




/////Actualizar cuota 
router.post('/actualizarcuota', async (req, res, next) => {
    const { saldo_inicial, cuota_con_ajuste, Saldo_real, Ajuste_ICC, id  } = req.body


const act = {
    saldo_inicial, cuota_con_ajuste, Saldo_real, Ajuste_ICC 
}
await pool.query('UPDATE cuotas set ? WHERE id = ?', [act, id])


})


//borrar cuotas
router.get('/borrartodas/:id',isLoggedInn2, async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM cuotas WHERE id_lote = ?', [id])
        lote =  await pool.query('select * FROM lotes WHERE id = ?', [id])
      
        cuil_cuit = lote[0]['cuil_cuit']
        link = {
            toleranciadec:0
        }
        
        await pool.query('UPDATE clientes set ? WHERE cuil_cuit = ?', [link, cuil_cuit])
       
        res.send('Borradas correctamente')
    } catch (error) {
        console.log(error)
        res.send('Error algo sucedió')
    }


    
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



router.get('/ief/:id', isLoggedInn2, async (req, res) => {
    const id = req.params
    idaux = id.id
   

    let lote = await pool.query('select * from lotes where id = ? ', [idaux])
    let cantidad = (await pool.query('select count(*) from cuotas where id_lote = ? and parcialidad = "final"', [idaux]))[0]['count(*)']
    // console.log(cantidad)    cantidad de liquidadas y vencidas
    if (cantidad === 0) {
        console.log(lote)
        idaux = lote[0]['idcuotas']
         cantidad = (await pool.query('select count(*) from cuotas where id_lote = ? and parcialidad = "final"', [idaux]))[0]['count(*)']
    }


    let devengado = ((await pool.query('select sum(cuota_con_ajuste) from cuotas where id_lote = ? and parcialidad = "final"', [idaux]))[0]['sum(cuota_con_ajuste)'])
    // console.log(devengado)

    let abonado = (await pool.query('select sum(pagos.monto)  from cuotas join pagos on cuotas.id = pagos.id_cuota and pagos.estado = "A" where id_lote = ? and parcialidad = "final"', [idaux]))[0]['sum(pagos.monto)']
 
    console.log(cantidad)
   
    exigible = (devengado - abonado).toFixed(2)
    if (cantidad === 0) {
       console.log('undefined')
        const dato1 = {
            'datoa': 'Cantidad de cuotas liquidadas y vencidas',
            'datob': "No hay cuotas Calculadas"
        }
        const dato2 = {
            'datoa': 'Monto devengado hasta la cuota',
            'datob': "No hay cuotas Calculadas"
        }
        const dato3 = {
            'datoa': 'Monto abonado hasta la cuota',
            'datob': "No hay cuotas Calculadas"
        }
        const dato4 = {
            'datoa': 'Deuda Exigible',
            'datob': "No hay cuotas Calculadas"
        }
        const deuda_exigible = [dato1, dato2, dato3, dato4]
        const dato5 = {
            'datoa': 'Cantidad de cuotas a Vencer',
            'datob': 'no calculado'
        }
        const dato6 = {
            'datoa': 'Monto cuota pura',
            'datob': 'no calculado'
        }
        const dato7 = {
            'datoa': 'Saldo de capital a vencer',
            'datob': 'no calculado'
        }

        const cuotas_pendientes = [dato5, dato6, dato7]
        const respuesta = [deuda_exigible, cuotas_pendientes]


        res.json(respuesta)
    } else {
           console.log('defined')
        devengado.toFixed(2)
        //////SI HAY CUOTAS 

        try {
           devengado= devengado.toFixed(2)
        } catch (error) {
            console.log(error)
        }
        try {
           abonado= abonado.toFixed(2)
        } catch (error) {
            console.log(error)
        } 

        const dato1 = {
            'datoa': 'Cantidad de cuotas liquidadas y vencidas',
            'datob': cantidad
        }
        const dato2 = {
            'datoa': 'Monto devengado hasta la cuota',
            'datob': devengado
        }
        const dato3 = {
            'datoa': 'Monto abonado hasta la cuota',
            'datob': abonado
        }
        const dato4 = {
            'datoa': 'Deuda Exigible',
            'datob': exigible
        }
        const deuda_exigible = [dato1, dato2, dato3, dato4]
        try {
            const cantidad2 = (await pool.query('select count(*) from cuotas where id_lote = ? and parcialidad = "Original"', [idaux]))[0]['count(*)']

            const Amortizacion = (await pool.query('select * from cuotas where id_lote = ? ', [idaux]))[0]['Amortizacion']

            let capital = (await pool.query('select sum(Amortizacion ) from cuotas where id_lote = ? and parcialidad = "Original"', [idaux]))[0]['sum(Amortizacion )']
            console.log(cantidad2)
            console.log(Amortizacion)
           

            try {
                capital = capital.toFixed(2)
            } catch (error) {
                
            }

            const dato5 = {
                'datoa': 'Cantidad de cuotas a Vencer',
                'datob': cantidad2
            }
            const dato6 = {
                'datoa': 'Monto cuota pura',
                'datob': Amortizacion
            }
            const dato7 = {
                'datoa': 'Saldo de capital a vencer',
                'datob': capital
            }
            const cuotas_pendientes = [dato5, dato6, dato7]
            const respuesta = [deuda_exigible, cuotas_pendientes]


            res.json(respuesta)

        } catch (error) {

        }


      

    }




   


})


///trae una cuota 

router.get('/traercuota/:id',isLoggedInn2, async (req, res) => {
    const { id } = req.params;
    
    try {
        cuota = await pool.query('select * from cuotas where id = ?',[id])
        
 
        res.json(cuota)
    } catch (error) {
        console.log(error)
    }
})


///trae las cuotas finales de un lote//objetivo: mostrar para pagar varias en una 
router.get('/traercuotasfinales/:id',isLoggedInn2, async (req, res) => {
    const { id } = req.params;
    
    try {
        cuota = await pool.query('select * from cuotas where id = ?',[id])
        
        todas = await pool.query('select * from cuotas where id_lote = ? and parcialidad = "final"',[cuota[0]['id_lote']])
      console.log(todas.length)
        res.json(todas)
    } catch (error) {
        console.log(error)
    }
})

module.exports = router


