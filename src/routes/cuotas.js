const express = require('express')
const router = express.Router()
const pool = require('../database')
const { isLevel2 } = require('../lib/authnivel2')
const { isLoggedIn } = require('../lib/auth') //proteger profile



//



//LISTADO DE TODAS LAS CUOTAS 
router.get("/lista", isLevel2, isLoggedIn, async (req, res) => {

    const cuotas = await pool.query('SELECT * FROM  cuotas ')


    res.render('cuotas/lista', { cuotas }) 

})
//LISTADO AMPLIO DE TODAS LAS CUOTAS
router.get("/ampliar", isLevel2, isLoggedIn, async (req, res) => {
    const cuotas = await pool.query('SELECT * FROM cuotas ')
    res.render('cuotas/listaamp', { cuotas })
})


//--------INICIO AGREGAR CUOTAS---------------------------------------------------------------------------


//PAGINA DE AGREGAR CUOTAS UAN O VARIAS 
router.get('/add', isLoggedIn, (req, res) => {
    res.render('cuotas/add')

})
// AGREGAR UNA SOLA CUOTA 
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

// AGREGA VARIAS CUOTAS 
router.post('/addaut', async (req, res) => {
    var { cuil_cuit, monto_total, cantidad_cuotas, lote, mes, anio} = req.body;
    const Amortizacion = monto_total / cantidad_cuotas;
  
    var nro_cuota = 1
    var saldo_inicial = monto_total
    console.log(cuil_cuit)
    const row = await pool.query('SELECT * from clientes where cuil_cuit = ?', [req.body.cuil_cuit])
    if (row.length > 0) {
        var saldo_cierre = saldo_inicial - Amortizacion
        const Saldo_real = saldo_inicial
        const id_cliente = row[0].id


        for (var i = 1; i <= cantidad_cuotas; i++) {
            nro_cuota = i
            const newLink = {
                //fecha,
                mes,
                anio,
                nro_cuota,
                Amortizacion,
                saldo_inicial,
                saldo_cierre,
                cuil_cuit,
                id_cliente,
                lote,
                Saldo_real
        
            };
            mes++
           
            if (mes>12){
              
                anio++
                mes-=12
            }

         await pool.query('INSERT INTO cuotas SET ?', [newLink]);

            saldo_inicial -= Amortizacion
            saldo_cierre = saldo_inicial - Amortizacion
        } req.flash('success', 'Guardado correctamente')
        res.redirect('/cuotas/lista')
    }

    else {
        req.flash('message', 'Error cliente no existe')
        res.redirect('/cuotas/add')
    }
})



//--------FIN AGREGAR CUOTAS----------------------------------------------------------------------------





// LISTADO DE CUOTAS DE UN CUIL DETERMINADO 

router.get("/cuotas/:cuil_cuit", isLoggedIn, async (req, res) => {
    const cuil_cuit = req.params.cuil_cuit
    const cuotas = await pool.query('SELECT * FROM cuotas WHERE cuil_cuit = ?', [cuil_cuit])
    res.render('cuotas/lista', { cuotas })
})





// PAGINA DE EDITAR CLIENTE    **NO PROBADO 
router.get("/edit/:id", isLoggedIn, async (req, res) => {
    const id = req.params.id
    const cuotas = await pool.query('SELECT * FROM cuotas WHERE id = ?', [id])
    res.render('cuotas/edit', { cuotas })
})


//-------------------------------------------------------------------------AGREGAR ICC
// AGREGAR ICC DE UN SOLO CLIENTE
router.get("/agregar_icc/:id", isLoggedIn, async (req, res) => {
    const id = req.params.id
    const cuotas = await pool.query('SELECT * FROM cuotas WHERE id = ?', [id])
    res.render('cuotas/agregaricc', { cuotas })
})
// ACCION DE  AGREGAR ICC
router.post('/agregaricc', async (req, res, ) => {
    const { id,  ICC, nro_cuota,cuil_cuit, Amortizacion} = req.body;
  const cuotaa = await pool.query("select * from cuotas where id = ? ", [id])
  
   const parcialidad = "Final"
    if (nro_cuota == 1){
        saldo_inicial = cuotaa[0]["saldo_inicial"]
        const Ajuste_ICC =  0
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
    }else {
        const anterior = await pool.query('Select * from cuotas where nro_cuota = ? and cuil_cuit = ?',[nro_cuota-1,cuil_cuit])
       
        var  Saldo_real_anterior =  anterior[0]["Saldo_real"]
        
        const cuota_con_ajuste_anterior = anterior[0]["cuota_con_ajuste"]
       
        const Base_calculo = cuota_con_ajuste_anterior
        const Ajuste_ICC =  cuota_con_ajuste_anterior*ICC
       
        const cuota_con_ajuste = cuota_con_ajuste_anterior+Ajuste_ICC
        Saldo_real_anterior+=Ajuste_ICC
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
    res.redirect(`/cuotas/ampliar`);
  
 
    
})


//PAGINA  AGREGAR ICC GENERAL
router.get("/agregariccgral", isLoggedIn, async (req, res) => {
  
   
    res.render('cuotas/agregariccgral')
})


//ACCION DE  AGREGAR ICC GENERAL
router.post('/agregariccgral', async (req, res, ) => {
    const { ICC, mes,anio} = req.body;
    const todas = await pool.query("select * from cuotas where mes =? and anio =?",[mes,anio])
    const parcialidad = "Final"
    for (var i=0; i<todas.length; i++) {
   
        if (todas[0]["nro_cuota"] == 1){
            saldo_inicial = todas[i]["saldo_inicial"]
            const Ajuste_ICC =  0
            const Base_calculo = todas[i]["Amortizacion"]
            const cuota_con_ajuste = todas[i]["Amortizacion"]
            const Saldo_real = todas[i]["saldo_inicial"]
    
            
            
        }else {
            const nro = todas[i]["nro_cuota"]
            const anterior = await pool.query('Select * from cuotas where nro_cuota = ? and cuil_cuit = ?',[nro-1,todas[i]["cuil_cuit"]])
           
            var  Saldo_real_anterior =  anterior[0]["Saldo_real"]
            
            const cuota_con_ajuste_anterior = anterior[0]["cuota_con_ajuste"]
           
            const Base_calculo = cuota_con_ajuste_anterior
            const Ajuste_ICC =  cuota_con_ajuste_anterior*ICC
           
            const cuota_con_ajuste = cuota_con_ajuste_anterior+Ajuste_ICC
            Saldo_real_anterior+=Ajuste_ICC
            const Saldo_real = Saldo_real_anterior
    
           
           
        }
        var cuota = {
            ICC,
            Ajuste_ICC,
            Base_calculo,
            cuota_con_ajuste,
            Saldo_real,
            parcialidad
            
        }
        try {
            await pool.query('UPDATE cuotas set ? WHERE id = ?', [cuota, todas[i]["id"]])
            
        } catch (error) {
            console.log(error)
            res.redirect(`/cuotas`);
            
        }
       
       
    
    }

    res.redirect(`/cuotas`);
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
    await pool.query('DELETE FROM cuotas WHERE ID = ?', [id])
    req.flash('success', 'Cuotas eliminadas')
    res.redirect('/cuotas')
})

//----- Ver... no esta enchufado

router.post('/cuotas', async (req, res, next) => {
    const { id } = req.body
    const rows = await pool.query('SELECT * FROM cuotas WHERE id_cliente = ?', [id])
    console.log(id)
    if (rows.length > 0) {
        res.redirect(`../cuotas/${id}`)


    } else { res.redirect('clientes') }

})

//PRUEBA
router.post('/prueba', async (req, res, ) => {
    const { saldo_inicial, Amortizacion, Base_calculo, ICC, Ajuste_ICC ,cuota_con_ajuste , saldo_cierre, id } = req.body;
      
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


