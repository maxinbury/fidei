const express = require('express')
const router = express.Router()
const pool = require('../database')
const XLSX = require('xlsx')
const { isLoggedIn, isLoggedInn2 } = require('../lib/auth') //proteger profile
const http = require('http');
const https = require('https');
const { pendientes, aprobar, aprobarcomp, rechazar2, rechazarcomp, pendientestodas, rechazo, aprobacioncbu, aprobarcbu, rechazarcbu, rechazobu, postrechazocbu } = require('../controladores/aprobacionesControlador')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const pagodecuota = require('./funciones/pagoDeCuota')
const {credenciales} = require ('../mp')
const mercadopago = require('mercadopago')
////

mercadopago.configure(credenciales)



const diskstorage = multer.diskStorage({
  destination: path.join(__dirname, '../Excel'),
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-estr-' + file.originalname)

  }
}) //para que almacene temporalmente la imagen
const fileUpload = multer({
  storage: diskstorage,

}).single('image')




////////////prueba de mercadopago
router.post('/noti/:id/:algo', async (req, res) => {
  const { query } = req
  const{ id} = req.params

 const topic = query.topic || query.type

 switch(topic){
  case "payment":
    const paymentId = query.id || query['data.id']
    //console.log(topic,'getting payment', paymentId)
    payment = await mercadopago.payment.findById(paymentId)
    //console.log(topic,'get merchant order')
     var {body}  = await  mercadopago.merchant_orders.findById(payment.body.order.id)
    break;
  case "merchant_order":
    const orderId = query.id;
   // console.log(topic,'getting merchant order', orderId)
   
   var {body} = await  mercadopago.merchant_orders.findById(orderId)
    break;
 }
 var paidAmount = 0
 body.payments.forEach(payment=>{
  if (payment.status ==='approved'){
    paidAmount+= payment.transaction_amount
  }
 })

 if (paidAmount >= body.total_amount){
  //console.log('Se concreto correctamente')
 }else{
 // console.log('No se concreto')
 }
  //res.send('ola')

})







router.get('/traerlinkcuota/:id', async (req, res) => {
 const {id} = req.params

 let cuota = await pool.query('select * from cuotas where id  = ?',[id] )
 monto=cuota[0]['cuota_con_ajuste']
  // Crea un objeto de preferencia
  let preference = {
    back_urls: {
      success: 'google.com',
      failure: '',
      pendig: '',
    },
    items: [

      {
        title: "Mi producto",
        unit_price: monto,
        quantity: 1,
        id: 123,
        description:'',
    
        concurrency_id: 'ARS',
        quantity: 1
      },
    ],
    notification_url: 'https://c143-181-168-103-40.sa.ngrok.io/administracion/noti/'+id+'/'+100///postear elaviso del pago
  };

  mercadopago.preferences
    .create(preference)
    .then(function (response) {
      res.json(response.body.init_point)
      // En esta instancia deberás asignar el valor dentro de response.body.id por el ID de preferencia solicitado en el siguiente paso
    })
    .catch(function (error) {
      //console.log(error);
    });





})


router.get('/mercado', async (req, res) => {
 

  // Crea un objeto de preferencia
  let preference = {
    back_urls: {
      success: 'google.com',
      failure: '',
      pendig: '',
    },
    items: [

      {
        title: "Mi producto",
        unit_price: 100,
        quantity: 1,
        id: 123,
        description:'',
    
        concurrency_id: 'ARS',
        quantity: 1
      },
    ],
    notification_url: 'https://c143-181-168-103-40.sa.ngrok.io/administracion/noti/'+123+'/'+100///postear elaviso del pago
  };

  mercadopago.preferences
    .create(preference)
    .then(function (response) {
      res.json(response.body.init_point)
      // En esta instancia deberás asignar el valor dentro de response.body.id por el ID de preferencia solicitado en el siguiente paso
    })
    .catch(function (error) {
      //console.log(error);
    });





})

router.get('/verpago', async (req, res) => {


  mercadopago.merchant_orders.findById('8540988134').then(res=>console.log(res.body))
  


})






router.post('/subirprueba', fileUpload, async (req, res, done) => {
  const { formdata, file } = req.body

  try {


    const type = req.file.mimetype
    const name = req.file.originalname
    // const data = fs.readFileSync(path.join(__dirname, '../Excel' + req.file.filename))
    fech = (new Date(Date.now())).toLocaleDateString()

    const datoss = {
      fecha: fech,
      ubicacion: req.file.filename/////ubicacion


    }
    await pool.query('insert into extracto set?', datoss)
    res.send('Imagen guardada con exito')
  } catch (error) {
    //console.log(error)
  }




})

router.post('/cambiarestado', isLoggedInn2, async (req, res) => {
  const { id, estado } = req.body
  try {
    const cuota = {
      estado,
      cuil_cuit: 0
    }
    await pool.query('UPDATE lotes set ? WHERE id = ?', [cuota, id])
    res.json('todo ok')
  } catch (error) {
    //console.log(error)
    res.json('Algo salio mal')
  }
})
///////////borrar todos lospagos
router.get('/borrartodoslospagos', isLoggedInn2, async (req, res) => {


  await pool.query('DELETE FROM pagos WHERE ', [cuil_cuit])
  res.send('borrado')

})
/////traer todos los pagos
router.get('/pagos', isLoggedInn2, async (req, res) => {

  pagos = await pool.query('select  * from pagos ')

  res.json(pagos)

})
//// borrar un pago
router.get('/borrarpago/:id', isLoggedInn2, async (req, res) => {
  const id = req.params.id
  pago = await pool.query('select * from pagos where id=?', [id])
  monto = parseFloat(-pago[0]['monto'])

  idcuotas = pago[0]['id_cuota']

  if (pago[0]['estado'] === 'A') {

    await pagodecuota.pagodecuota(idcuotas, monto)
  }


  await pool.query('DELETE FROM pagos WHERE id= ?', [id])
  res.send('enviado')

})



// LISTA TODAS PENDIENTES PAra React
//   ver***
router.get('/borrarusuario/:cuil_cuit', isLoggedInn2, async (req, res) => {
  const { cuil_cuit } = req.params

  await pool.query('DELETE FROM users WHERE cuil_cuit = ?', [cuil_cuit])
  res.send('borrado')

})
///cargar estracto
router.get('/extracto', async (req, res) => {



  try {

    etc = await pool.query('select * from extracto')
    nombre = etc[(etc.length) - 1]['ubicacion']
    // const workbook = XLSX.readFile('./src/Excel/'+nombre)
    const workbook = XLSX.readFile(path.join(__dirname, '../Excel/' + nombre))
    const workbooksheets = workbook.SheetNames
    const sheet = workbooksheets[0]

    const dataExcel = XLSX.utils.sheet_to_json(workbook.Sheets[sheet])
    //console.log(dataExcel)

    let regex = /(\d+)/g;
    let mandar = []
    for (const property in dataExcel) {
      /*  if ((dataExcel[property]['Descripción']).includes(cuil_cuit)) {
           estado = 'A'
           // tipo de pago normal 
       } */

      try {



        descripcion = (dataExcel[property]['Descripción']).match(regex)
        fecha = dataExcel[property]['']
        referencia = dataExcel[property]['Referencia']
        debitos = dataExcel[property]['Débitos']
        creditos = dataExcel[property]['Créditos']
        nuevo = {
          fecha,
          descripcion,
          referencia,
          debitos,
          creditos,


        }

        mandar.push(nuevo);
      } catch (error) {
        console.log(error)
      }

    }
    res.json(mandar)
  }
  catch (error) {
   // console.log(error)
  }





})


module.exports = router
