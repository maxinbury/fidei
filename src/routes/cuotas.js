const express = require('express')
const router = express.Router()
const pool = require('../database')

const { isLoggedIn,isLoggedInn2, isLoggedInn4  } = require('../lib/auth') //proteger profile

const { lista,addautvarias, ampliar, add_cliente, cuotasdeunlote, postadd, postaddaut2, postaddaut, quelote, lotefuncion, lotefuncion2, cuotascli, edit_c, agregar_icc, post_agregaricc, lotes, asignarloteacuotas, modificarmontototal, traercuotaselcliente, listavarios, deletes, postcuotas, actualizarcuota, borrartodas, ief, traercuota, traercuotasfinales, agregarcuotasleg, vercuotas2, vercuotas4, ief2, borrarpago, traercuotasdisponiblesporlote, iefgralleg } = require('../controladores/cuotasControlador')



//LISTADO DE TODAS LAS CUOTAS ------------- no esta conectado

router.get("/lista",  isLoggedIn, lista)



//LISTADO AMPLIO DE TODAS LAS CUOTAS
router.get("/ampliar/:cuil_cuit",  isLoggedIn, ampliar)


//--------INICIO AGREGAR CUOTAS---------------------------------------------------------------------------


//PAGINA DE AGREGAR CUOTAS UNA O VARIAS 
router.get('/add/cliente/:id', isLoggedIn, add_cliente)

// AGREGAR UNA SOLA CUOTA 
router.post('/add',  postadd)
router.post('/borrarpago',  borrarpago)






// AGREGA VARIAS CUOTAS 
router.post('/addaut', postaddaut)
router.post('/addaut2',isLoggedInn2, postaddaut2)

router.post('/agregarcuotasleg',isLoggedInn2, agregarcuotasleg)


router.post('/addautvarias',isLoggedInn2, addautvarias)


/// cuotasdeunloteReact
router.get("/cuotasdeunlote/:id",isLoggedInn2, cuotasdeunlote)



//--------FIN AGREGAR CUOTAS----------------------------------------------------------------------------
// elegir lote

router.get("/quelote/:cuil_cuit", isLoggedIn,  quelote)

// LISTADO DE CUOTAS DE UN lote DETERMINADO 

router.get("/lote/:id", lotefuncion)
// auxililar react
router.get("/lote2/:id",isLoggedInn2, lotefuncion2)



router.get("/vercuotas2/:id",isLoggedInn2,vercuotas2 )



router.get("/vercuotas4/:id",/* isLoggedInn2, */vercuotas4 )

// LISTADO DE CUOTAS DE UN CUIL DETERMINADO 
//desconectamos 
router.get("/cuotas/:cuil_cuit", isLoggedIn,  cuotascli)

// PAGINA DE EDITAR CLIENTE    **NO PROBADO 
router.get("/edit/:id", isLoggedIn,  edit_c)

//-------------------------------------------------------------------------AGREGAR ICC
// AGREGAR ICC DE UN SOLO CLIENTE
router.get("/agregar_icc/:id", isLoggedIn,  agregar_icc)

// ACCION DE  AGREGAR ICC  REACT
router.post('/agregaricc', isLoggedInn2, post_agregaricc)

// redireccion a lotes del cliente 
router.get("/lotes/:cuil_cuit", isLoggedIn, lotes)

//////////asignar a lotes cuadro decuotasexistente
router.post('/asignarloteacuotas', asignarloteacuotas)
//-------------------------------------------------------------------------FIN  AGREGAR ICC---------------------------------------

router.post('/modificarmontotal', modificarmontototal)

router.get('/traercuotaselcliente/:id', isLoggedInn2, traercuotaselcliente)

router.get('/listavarios/:cuil_cuit', isLoggedInn2, listavarios)

router.get('/delete/:id', isLoggedInn2, deletes)
//----- Ver... no esta enchufado

router.post('/cuotas',postcuotas)

/////Actualizar cuota 
router.post('/actualizarcuota', actualizarcuota)


//borrar cuotas
router.get('/borrartodas/:id',isLoggedInn2,borrartodas)



router.get('/ief/:id', isLoggedInn2, ief)

router.get('/ief2/:id', ief2)


router.get('/iefgralleg',isLoggedInn4, iefgralleg)



///trae una cuota 

router.get('/traercuota/:id',isLoggedInn2, traercuota)


///trae las cuotas finales de un lote//objetivo: mostrar para pagar varias en una 
router.get('/traercuotasfinales/:id',isLoggedInn2,traercuotasfinales)


router.get('/traercuotasdisponiblesporlote/:id',isLoggedInn2,traercuotasdisponiblesporlote)


router.get('/corregir', async(req,res)=>{

    cuotas = await pool.query('select * from cuotas where zona="Legales"')

    for( i in cuotas){
console.log(cuotas[i]['pago'])
        if (cuotas[i]['pago'] == null ){
            await pool.query('UPDATE cuotas SET Saldo_real = ? WHERE id=? ',[ parseFloat(cuotas[i]['saldo_inicial'])-0 ,cuotas[i]['id']])

        }else{
        await pool.query('UPDATE cuotas SET Saldo_real = ? WHERE id=? ',[ parseFloat(cuotas[i]['saldo_inicial'])-parseFloat(cuotas[i]['pago']) ,cuotas[i]['id']])
}

    }
res.json('Realizado')
})


module.exports = router


