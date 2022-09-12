const express = require('express')
const router = express.Router()
const pool = require('../database')
const { isLevel2 } = require('../lib/authnivel2')
const { isLoggedIn } = require('../lib/auth') //proteger profile
const XLSX = require('xlsx')

///////


/////








router.get("/completar_cuil_cuit", isLoggedIn, isLevel2, async (req, res) => {


    const lotes = await pool.query('select * from lotes')

    for (var i = 0; i < lotes.length; i++) {
        try {


            aux = '%' + lotes[i]['nombre_razon'] + '%'
            console.log(aux)
            cliente = await pool.query('select * from clientes where Nombre like ?', [aux])
            console.log(cliente)
            cuil_cuit = cliente[0]['cuil_cuit']
            let neew = { cuil_cuit }

            id = lotes[i]['id']
            await pool.query('UPDATE lotes SET ? where id =?', [neew, id])

        } catch (error) {
            console.log(error)
        }
    }

    res.render('links/list', { links })
})


router.get('/lotescliente/:cuil_cuit', async (req, res) => {
    cuil_cuit = req.params.cuil_cuit


    lotes = await pool.query('select  cuil_cuit, id,zona, fraccion, manzana, lote, parcela from lotes where cuil_cuit =  ?', [cuil_cuit]);
    console.log(lotes)


    res.json(lotes)

})

router.post('/calcularvalor', async (req, res) => {
    const { zona, manzana, parcela, cuil_cuit,lote } = req.body
    console.log(cuil_cuit)

    if (zona==='PIT'){
        valormetro= await pool.query('select * from nivel3 where valormetroparque = "PIT" order by id')
         lotee = await pool.query('select * from lotes where zona = ? and manzana =? and  parcela =? ', [zona, manzana, parcela])
    }else{
        valormetro= await pool.query('select * from nivel3 where valormetroparque != "PIT" order by id')
         lotee = await pool.query('select * from lotes where zona = ? and manzana =? and  lote =? ', [zona, manzana, lote])
    }

   


    try {
        valor = valormetro[(valormetro.length-1)]['valormetrocuadrado']  
      
    } catch (error) {
        
    }
 
   if  (valor != undefined){
   
    try {
       const  aux= '%'+cuil_cuit+'%'
   const cliente = await pool.query('select * from clientes where cuil_cuit like ? ', aux)
   const ingresos = cliente[0]['ingresos']
   const max = ingresos*0.3
   console.log(lotee) 
 
    let final = lotee[0]['superficie'] * valor
    console.log(final)
    const estado = lotee[0]['estado']

    const nombre = 'Zona: '+ lotee[0]['zona'] +' Manzana: '+lotee[0]['manzana']  +' Parcela: '+lotee[0]['parcela']
    finalSant= final*0.8
    const cuotas60 = finalSant/60
   
        let puede=true
    let cuotamuygrande =""
    if (max <= cuotas60){
        cuotamuygrande='La cuota es mas grande que  el 30%'
        puede=false
    }
   
    let lotetieneasignado =""
    if ((estado != "DISPONIBLE" &&  "Disponible") ){
        lotetieneasignado='El lote no se encuentra disponible'
        puede=false
    }

    const detalle = {
        precio: final.toFixed(2),
        superficie: lotee[0]['superficie'],
        nombre: nombre,
        cuotas60: cuotas60.toFixed(2),
        ingresos: ingresos,
        estado:estado,
        cuotamuygrande,
        lotetieneasignado,
        puede,
        valor
    }
    console.log(detalle)

    res.json(detalle)
 } catch (error) {
        res.send('Algo salio mal ')
    }}else {  res.send('Algo salio mal ') }

})


///////

router.get('/lotescliente2/:cuil_cuit', async (req, res) => {
    cuil_cuit = req.params.cuil_cuit


    lotes = await pool.query('select  cuil_cuit, id,zona, fraccion, manzana, lote from lotes where cuil_cuit like  ?', [cuil_cuit]);
    console.log(lotes)


    res.json(lotes)

})







//////


router.get('/cargar_movimientos', isLoggedIn, isLevel2, async (req, res) => {
    console.log("entra")
    const workbook = XLSX.readFile('./src/Book2.xlsx')
    const workbooksheets = workbook.SheetNames
    const sheet = workbooksheets[0]

    const dataExcel = XLSX.utils.sheet_to_json(workbook.Sheets[sheet])
    //console.log(dataExcel)



    var a = 1
    for (const property in dataExcel) {
        a += 1
        try {
            const newLink = {
                zona: 'PIT',
                mensura: dataExcel[property]['N° Mensura'],
                parcela: dataExcel[property]['Parcela'],
                manzana: dataExcel[property]['Manzana'],
                lote: dataExcel[property]['Lote'],
                adrema: dataExcel[property]['Adrema'],
                superficie: dataExcel[property]['Superficie en m²'],
                nombre_razon: dataExcel[property]['Apellido y Nombre / Razon Social'],
                estado: dataExcel[property]['Estado'],
                observaciones: dataExcel[property]['Observacion'],
                pocentaje: dataExcel[property]['pocentaje'],
                compradorreserva: dataExcel[property]['Comprador/Reserva'],
                proyecto: dataExcel[property]['Proyecto'],




            }


            await pool.query('INSERT INTO lotes set ?', [newLink]);
            console.log('Exito ' + a)
        } catch (e) {
            console.log(e)
        }


    }




    res.redirect('/links/clientes')
})






//  LEER Y CARGAR DEL EXCEL . NO CONECTAR/*
/*
router.get('/cargar_todos', isLoggedIn, isLevel2, async (req, res) => {
    console.log("entra")
  const workbook = XLSX.readFile('./src/Book1.xlsx')
    const workbooksheets = workbook.SheetNames
    const sheet = workbooksheets[0]

    const dataExcel = XLSX.utils.sheet_to_json(workbook.Sheets[sheet])
    //console.log(dataExcel)
    console.log(dataExcel)


    var a=1
    for (const property in dataExcel) {
        a+=1
        try{
        const newLink = {
            numero_orden:dataExcel[property]['N° Orden'],
            mensura: dataExcel[property]['N° Mensura'],
            fraccion : dataExcel[property]['Fraccion'],
            manzana:dataExcel[property]['Manzana'],
            lote:dataExcel[property]['Lote'],
            adrema: dataExcel[property]['N° Adrema'],
            superficie: dataExcel[property]['Superficie en m²'],
            nombre_razon: dataExcel[property]['Apellido y Nombre / Razon Social'],
            estado: dataExcel[property]['Estado'],
            observaciones:dataExcel[property]['Observacion'],
            

        }
      

        await pool.query('INSERT INTO lotes set ?', [newLink]);
    }catch(e){
        console.log(e)
    }
       
        /* if ((dataExcel[property]['Sucursal']).includes(cuil_cuit)) {
            estado = 'A'
        }

    }
 



    res.redirect('/links/clientes')
})

*/



//LISTA DE LOTES 
router.get('/listadetodos', async (req, res) => {
    console.log('si')
    const lotes = await pool.query('select * from lotes')


    res.json(lotes)
})
router.post('/prueba', async (req, res) => {
    let { zona, fraccion } = req.body
    console.log(fraccion)
    fraccion = fraccion.toUpperCase()
    console.log(fraccion)




})
//filtro solo lotes
router.get('/listadelotes', async (req, res) => {

    const zona = await pool.query('select zona from lotes group by=zona')


    res.json(zona)
})

router.get('/listadetodosamp', isLoggedIn, isLevel2, async (req, res) => {

    const lotes = await pool.query('select * from lotes')


    res.render('lotes/listadetodosamp', { lotes })
})












module.exports = router


