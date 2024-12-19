const express = require('express')
const router = express.Router()
const pool = require('../database')

const { isLoggedIn, isLoggedInn2, isLoggedInn4, isLoggedInn } = require('../lib/auth') //proteger profile

const { addautvarias, cuotasdeunlote, postadd, postaddaut2, lotefuncion2, post_agregaricc, asignarloteacuotas, modificarmontototal, traercuotaselcliente, listavarios, deletes, postcuotas, actualizarcuota, borrartodas, ief, traercuota, traercuotasfinales, agregarcuotasleg, vercuotas2, vercuotas4, ief2, borrarpago, traercuotasdisponiblesporlote, iefgralleg } = require('../controladores/cuotasControlador')







//--------INICIO AGREGAR CUOTAS---------------------------------------------------------------------------



// AGREGAR UNA SOLA CUOTA 
router.post('/add', postadd)
router.post('/borrarpago', borrarpago)






// AGREGA VARIAS CUOTAS 

router.post('/addaut2', isLoggedInn2, postaddaut2)

router.post('/agregarcuotasleg', isLoggedInn2, agregarcuotasleg)


router.post('/addautvarias', isLoggedInn2, addautvarias)


/// cuotasdeunloteReact
router.get("/cuotasdeunlote/:id", isLoggedInn, cuotasdeunlote)



//--------FIN AGREGAR CUOTAS----------------------------------------------------------------------------
// elegir lote




// auxililar react
router.get("/lote2/:id", isLoggedInn2, lotefuncion2)



router.get("/vercuotas2/:id", isLoggedInn2, vercuotas2)



router.get("/vercuotas4/:id",/* isLoggedInn2, */vercuotas4)

// LISTADO DE CUOTAS DE UN CUIL DETERMINADO 





//-------------------------------------------------------------------------AGREGAR ICC


// ACCION DE  AGREGAR ICC  REACT
router.post('/agregaricc', isLoggedInn2, post_agregaricc)



//////////asignar a lotes cuadro decuotasexistente
router.post('/asignarloteacuotas', asignarloteacuotas)
//-------------------------------------------------------------------------FIN  AGREGAR ICC---------------------------------------

router.post('/modificarmontotal', modificarmontototal)

router.get('/traercuotaselcliente/:id', isLoggedInn2, traercuotaselcliente)

router.get('/listavarios/:cuil_cuit', isLoggedInn2, listavarios)

router.get('/delete/:id', isLoggedInn2, deletes)
//----- Ver... no esta enchufado

router.post('/cuotas', postcuotas)

/////Actualizar cuota 
router.post('/actualizarcuota', actualizarcuota)


//borrar cuotas
router.get('/borrartodas/:id', isLoggedInn2, borrartodas)



router.get('/ief/:id', isLoggedInn2, ief)

router.get('/ief2/:id', ief2)


router.get('/iefgralleg', isLoggedInn4, iefgralleg)



///trae una cuota 

router.get('/traercuota/:id', isLoggedInn2, traercuota)


///trae las cuotas finales de un lote//objetivo: mostrar para pagar varias en una 
router.get('/traercuotasfinales/:id', isLoggedInn2, traercuotasfinales)


router.get('/traercuotasdisponiblesporlote/:id', isLoggedInn2, traercuotasdisponiblesporlote)

/* router.get('/actualic3', async (req, res) => {


    cuotas = await pool.query("select * from cuotas_ic3 ")
    for (i in cuotas) {
        try {
            let fecha = cuotas[i]['mes'];

            // Separa la fecha en partes usando split
            let partes = fecha.split('-');

            // Extrae el año y el mes
            let anio = partes[0];
            let mes = parseInt(partes[1], 10);
            await pool.query('UPDATE cuotas_ic3 SET mes = ?, anio =? WHERE id=? ', [mes, anio,cuotas[i]['id']])
console.log('ok')

        } catch (error) {
            console.log(error)
        }

    }




}) */


    router.get('/traercuotasic3/:cuil_cuit', async (req, res) => {
        const cuil_cuit = req.params.cuil_cuit;
    console.log(cuil_cuit)
        const cliente = await pool.query('select * from clientes where cuil_cuit=?', [cuil_cuit]);
        cuotas = await pool.query("select * from cuotas_ic3 where id_cliente=?", [cliente[0]['id']]);
        let env = [];
        for (let i in cuotas) {
            let pagos = await pool.query('select sum(monto) as total_pago from pagos where id_cuota=?', [cuotas[i]['id']]);
            let total_pago = pagos[0]['total_pago'] || 0; // Asignar 0 si es null
    
            let excedente = parseFloat(total_pago) - parseFloat(cuotas[i]['cuota_con_ajuste']);
            excedente = parseFloat(excedente).toFixed(2);
    
            let saldo_final = parseFloat(cuotas[i]['saldo_inicial']) - parseFloat(cuotas[i]['amortizacion']);
            saldo_final = parseFloat(saldo_final).toFixed(2);
    
            let saldo_real = parseFloat(saldo_final) - parseFloat(excedente);
            saldo_real = parseFloat(saldo_real).toFixed(2);
    
            let nuevo = {
                id: cuotas[i]['id'],
                mes: cuotas[i]['mes'],
                anio: cuotas[i]['anio'],
                pago: total_pago,
                excedente,
                cuota: cuotas[i]['cuota'],
                saldo_inicial: cuotas[i]['saldo_inicial'],
                amortizacion: parseFloat(cuotas[i]['amortizacion']).toFixed(2),
                ajuste: parseFloat(cuotas[i]['ajuste']).toFixed(2),
                ajuste_icc: parseFloat(cuotas[i]['ajuste_icc']).toFixed(2),
                cuota_con_ajuste: parseFloat(cuotas[i]['cuota_con_ajuste']).toFixed(2),
                iva: cuotas[i]['iva'],
                saldo_cierre: cuotas[i]['saldo_cierre'],
                saldo_final,
                saldo_real
            };
    
            env.push(nuevo);
        }
        res.json(env);
    });
    
router.get('/corregir', async (req, res) => {

    cuotas = await pool.query('select * from cuotas where zona="Legales"')

    for (i in cuotas) {

        if (cuotas[i]['pago'] == null) {
            await pool.query('UPDATE cuotas SET Saldo_real = ? WHERE id=? ', [parseFloat(cuotas[i]['saldo_inicial']) - 0, cuotas[i]['id']])

        } else {
            console.log(cuotas[i]['saldo_inicial'])
            console.log('---')
            console.log(cuotas[i]['pago'])

            await pool.query('UPDATE cuotas SET Saldo_real = ? WHERE id=? ', [parseFloat(cuotas[i]['saldo_inicial']) - parseFloat(cuotas[i]['pago']), cuotas[i]['id']])
        }

    }
    res.json('Realizado')
})


module.exports = router


