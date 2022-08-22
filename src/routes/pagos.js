const express = require('express')
const router = express.Router()
const pool = require('../database')
const { isLevel2 } = require('../lib/authnivel2')
const { isLoggedIn } = require('../lib/auth') //proteger profile

///////////////// REALIZAR PAGO MANUAL NIVEL 2 

router.post('/pagonivel2', async (req, res) => { // pagot es el objeto pago
    let { id, tipo, cuil_cuit, monto  } = req.body 
console.log(cuil_cuit)
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
    let pago =   parseFloat(monto) + parseFloat(cuota[0]["pago"])



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

        await pool.query('UPDATE cuotas set  ? WHERE id = ?', [update,id])

      await pool.query('INSERT INTO pagos set ?', [nuevo]);

   
      console.log('idlote'+id_lote)
        cant_finales= await pool.query('select * from cuotas  WHERE id_lote = ? and parcialidad = "Final"', [id_lote ])
     
    
        if (nro_cuota < cant_finales.length ) {/// aca esta el errror
           


        for (var i = (nro_cuota+1); i <=cant_finales.length; i++) {
        
            try {//
                
                aux =  await pool.query('select *from cuotas WHERE id_lote = ? and nro_cuota=?', [id_lote, i])
                console.log(aux)
                 saldo_realc = parseFloat( aux[0]["Saldo_real"])
                 console.log('saldoreal '+saldo_realc) 
                 idaux =  aux[0]["id"] 
                 console.log( id) 
               
                 console.log('pagop'+pago) 
                 Saldo_real = saldo_realc - monto
                 console.log(Saldo_real) 
                 const update = {
                    Saldo_real,
           
        
        
                }
                 await pool.query('UPDATE cuotas set  ? WHERE id = ?', [update, idaux])
            } catch (error) {//
                
            }

         }}


        console.log(cuota[0]['cuil_cuit'])
        res.send([cuota[0]['cuil_cuit'], 'Pago Realizado'])



    } catch (error) {
        res.send([cuota[0]['cuil_cuit'], 'Pago Realizado'])
    }

})
/// aprobar pago nivel 2
router.get('/aprobarr/:id', async (req, res) => { // pagot es el objeto pago
    const { id } = req.params

    var pagot = await pool.query('select * from pagos where id = ?', [id])

    let id_cuota = pagot[0]["id_cuota"]
    let monto = pagot[0]["monto"]

    


    const cuota = await pool.query('select * from cuotas where id = ?', [id_cuota]) //objeto cuota
   
    var saldo_realc = cuota[0]["Saldo_real"]
    var nro_cuota = cuota[0]["nro_cuota"]
    var id_lote = cuota[0]["id_lote"]

   

    try {
        
         Saldo_real = parseFloat(saldo_realc) - parseFloat(monto)
         
        let pago = cuota[0]["pago"] + pagot[0]["monto"]
      

        // Saldo_real = cuota[0]["saldo_inicial"] -saldo_realc  - pago 
       


        const update = {
            Saldo_real,
            pago,


        }
///////


////  

        await pool.query('UPDATE cuotas set  ? WHERE id = ?', [update, cuota[0]["id"]])
       
        cant_finales= await pool.query('select *from cuotas  WHERE id_lote = ? and parcialidad = "Final"', [id_lote, ])
        console.log(cant_finales)
       
        if (nro_cuota < cant_finales.length ) {
///



        for (var i = nro_cuota+1; i <=cant_finales.length; i++) {
        
            try {//
                aux =  await pool.query('select *from cuotas WHERE id_lote = ? and nro_cuota=?', [id_lote, i])
                saldo_realc = parseFloat( aux[0]["Saldo_real"])
                 idaux =  aux[0]["id"] 
                 Saldo_real = saldo_realc - pago
                 const update = {
                    Saldo_real,
           
        
        
                }
                 await pool.query('UPDATE cuotas set  ? WHERE id = ?', [update, idaux])
            } catch (error) {//
                
            }

         }}


        await pool.query('UPDATE pagos set estado = ? WHERE id = ?', ["A", id])
        res.send('Guardado correctamente')



        res.send('Exito')
    } catch (error) {

    }

})
///// Detalles del pago 
router.get("/detallespago/:id", async (req, res) => {
    const { id } = req.body 
console.log(id)

    const detalles = await pool.query('SELECT * FROM pagos where id_cuota = ?',[id])
   
    res.json(detalles)
  //*  res.json(cantidad[0]["count(*)"])
})




/////detalles de todos los pagos de una cuota
router.post("/detallespagos", async (req, res) => {
    const { id } = req.body 
    console.log(id)
const pagos =  await pool.query('SELECT * FROM pagos where id_cuota = ?',[id])
  


 
 res.json(pagos)
})



///////// Cantidad inusuales 
router.get("/cantidadinusuales", async (req, res) => {
    const cantidad = await pool.query('SELECT count(*) FROM historial_pagosi where estado = "Pendiente"')
    res.json(cantidad)
  //*  res.json(cantidad[0]["count(*)"])
})

///////// reaxct
router.get("/listainusual", async (req, res) => {
    const pagos = await pool.query('SELECT * FROM pagos join clientes on pagos.cuil_cuit= clientes.cuil_cuit where estado="averificarnivel3"')
    console.log(pagos)
    res.json(pagos)
})

//react pendientes
router.get('/pendientess', async (req, res) => {
   // const pendientes = await pool.query("Select * from pagos join estado_pago on pagos.estado=estado_pago.id_estado_pago where estado = 'P' or estado = 'ajustificar' ")
   const pendientes = await pool.query("Select * from pagos join estado_pago on pagos.estado=estado_pago.id_estado_pago where estado = 'P' or estado = 'ajustificar' or estado='justificacionp' ")
   console.log(pendientes)
    res.json(pendientes)




})

///// aprobar react


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
    const { id, detalle, accion } = req.body
    console.log(id)
    console.log(detalle)
    console.log(accion)
    auxi = await pool.query('select *  from pagos where id=?', [id]);
    cuil_cuit= auxi[0]['cuil_cuit']

    
    switch (accion) {
        case 'rechazar':
            console.log('rechazar')
            estado='averificarnivel3'
          //Declaraciones ejecutadas cuando el resultado de expresión coincide con el valor1
       


          break;
        case 'solicitar_doc':
            console.log('solicitar_doc')
            estado='ajustificar'
          //Declaraciones ejecutadas cuando el resultado de expresión coincide con el valor2
          const update2 ={
        
            cuil_cuit: cuil_cuit,
            id_referencia: id,
            descripcion: detalle
        }
            await pool.query('INSERT INTO notificaciones set ?', [update2]);
          break
    }


    const update ={
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



