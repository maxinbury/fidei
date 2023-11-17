const express = require('express')
const router = express.Router()
const pool = require('../database')
const { isLoggedIn,isLoggedInn, isLoggedInn2, isLoggedInn4} = require('../lib/auth') //proteger profile
const XLSX = require('xlsx')
const fs = require('fs')
const multer = require('multer')
const path = require('path')
const enviodemail = require('./Emails/Enviodemail')
const { determinarEmpresa, habilitar, estadisticasLegajos, deshabilitar, borrarCbu, cbusPendientes, legajosCuil, ventalotee, add2,add3, modificarCuil, AgregarIngreso, detalleCuil, cantidadInfo, lista2, ventaLoteleg } = require('../controladores/linksControlador')


/////////aws

const diskstorage = multer.diskStorage({
    destination: path.join(__dirname, '../../pdfs'),
    filename: (req, file, cb) => {

        cb(null, Date.now() + '-legajo-' + file.originalname)


    }
}) //para que almacene temporalmente la imagen
const fileUpload = multer({
    storage: diskstorage,

}).single('image')




router.post('/determinarempresa', isLoggedInn2, determinarEmpresa)

router.post('/habilitar',isLoggedInn2, habilitar)


router.post("/estadisticaslegajos", isLoggedInn2, estadisticasLegajos)



router.post('/deshabilitar',isLoggedInn2, deshabilitar)


/// borrar CBU, cualquier nivel

router.get('/borrarcbu/:id',isLoggedInn,  borrarCbu)


///// Funcion devuelve cantidad de clientes /// agregar 

router.get('/infocantidad',cantidadInfo )

router.get('/completarobservaciones',async (req, res) => {
    try {
        const todos = await pool.query('select * from clientes')
for (x in todos ){
  if (todos[x]['cuil_cuit'] !=0){
    lotes = await pool.query('select * from lotes where cuil_cuit=?',[todos[x]['cuil_cuit']])
    lot= '' 
       try {
        for (y in lotes){
        
                if (lotes[y]['zona']=="IC3"){
                    lot=lot +lotes[y]['zona']+' -Fr: '+lotes[y]['fraccion']+' -Mz: '+lotes[y]['manzana']+' -Lote: '+lotes[y]['lote']+' // '
                } else{
                    lot=lot +lotes[y]['zona']+' -Fr: '+lotes[y]['fraccion']+' -Mz: '+lotes[y]['manzana']+' -Parc: '+lotes[y]['parcela']+' // '
    
    
                }
           
           
           



        }
    await pool.query('UPDATE clientes set  observaciones=? WHERE id = ?', [lot, todos[x]['id']])
 } catch (error) {
                console.log(error)
            }
}
}
    } catch (error) {
        console.log(error)
        res.json('error')
    }
res.json('listo')

}

)



router.get('/lista2',isLoggedInn4,lista2 )


router.post('/ventaLoteleg',ventaLoteleg )



router.get('/cbuspendientes', isLoggedInn2, cbusPendientes)

//lista legajos de un cliente 
router.get('/legajos/:cuil_cuit',isLoggedInn2, legajosCuil)



//Asignar lote a usuario 
router.post('/ventalotee',isLoggedInn2, ventalotee)

////react 
router.post('/add2',isLoggedInn2, add2)
//legales
router.post('/add3',isLoggedInn2, add3)
///////modificar cuil
router.post('/modificarcuil',isLoggedInn2, modificarCuil)
/////////


router.post('/agregaringreso2',isLoggedInn2, AgregarIngreso)
////////////////////////////////


router.get('/detalle/:cuil_cuit',detalleCuil)


router.get('/clientehabilitado/:cuil_cuit',isLoggedInn2, async (req, res) => {
    const { cuil_cuit } = req.params
 
    const links = await pool.query('SELECT * FROM clientes WHERE cuil_cuit= ?', [cuil_cuit])
    const habilitado = await pool.query('SELECT * FROM registro_operaciones WHERE cuil_cuit_referencia = ? and (adicional = "Habilitado" or adicional = "Deshabilitado")', [cuil_cuit])
   console.log(habilitado.length)
   console.log(habilitado)
    if (habilitado.length>0){
    reg= habilitado[(habilitado.length)-1]
        }else{
            reg= {cuil_cuit:'Sistema',
            fecha: '20/05/2022'}

        }
    
    res.json([links,reg])

})
// MODIDICACION CLIENTES


router.post('/modificarclientelegales',isLoggedInn2, async (req, res) => {
    const { cuil_cuit, email, Nombre, telefono, id } = req.body
    
    try {
 
        const newLink = {
        cuil_cuit,
        email,
        telefono,
        Nombre
        }
        console.log(newLink)
        console.log(id)
        await pool.query('UPDATE clientes set ? WHERE id= ?', [newLink, id])
        res.send('Cliente modificado')
    } catch (error) {
        res.send('Error algo sucedió' + error)
    }


})
router.post('/modificarcli',isLoggedInn2, async (req, res) => {
    const { cuil_cuit, email, provincia, telefono, ingresos, domicilio, razon_social, observaciones } = req.body
    
    try {
        aux = '%' + cuil_cuit + '%'
        const newLink = {
            email,
            provincia,
            telefono,
            ingresos,
            domicilio,
            razon_social,
            observaciones
        }
        await pool.query('UPDATE clientes set ? WHERE cuil_cuit like ?', [newLink, aux])
        res.send('Cliente modificado')
    } catch (error) {
        res.send('Error algo ssucedió' + error)
    }


})


router.post('/enviarmailprueba/',isLoggedInn2, async (req, res) => {
    const {cuil_cuit} = req.body
console.log(cuil_cuit)
  cli = await pool.query ('select * from clientes where cuil_cuit = ?',[cuil_cuit])
    
mensaje= 'Hola como estas '
console.log(cli)
console.log(mensaje)
email = cli[0]['email']
asunto = 'Aprobacion de CBU'
encabezado= 'Notificacion nueva'
enviodemail.enviarmail.enviarmail(email,asunto,encabezado,mensaje)




/* 
   let transporter = nodemailer.createTransport({
    host: "smtp-mail.outlook.com", // hostname
    port: 587, // port for secure SMTP
    secureConnection: false,
    tls: {
       ciphers:'SSLv3'
    },
    auth: {
        user: 'fideicomisoSCatalina@outlook.com',
        pass: '1385Fideicomiso'
    }
});

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"Administracion Santa Catalina " <fideicomisoSCatalina@outlook.com>', // sender address
    to: ["elotroyo005@gmail.com", email], // list of receivers
    subject: "Asunto lisa?", // Subject line
    text: mensaje, // plain text body
    html: "<b>Hello world?</b>", // html body
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...

 */


   

})



router.post('/subirlegajodni', fileUpload, async (req, res, done) => {
    const { tipo, cuil_cuit } = req.body


    try {
        console.log('1')
        const type = req.file.mimetype
        console.log('2')
        const name = req.file.originalname
        console.log('3')
        const data = fs.readFileSync(path.join(__dirname, '../../pdfs/' + req.file.filename))
        console.log(req.file.filename)

        const datos = {
            ubicacion: req.file.filename,
            tipo: tipo,
            cuil_cuit: cuil_cuit,
            estado: 'A',
        }
        await pool.query('insert into constancias set?', datos)
        console.log('req.file.filename')
        res.send('Imagen guardada con exito')
    } catch (error) {
        res.send('algo salio mal')
    }
    // console.log(req.file)






})
module.exports = router





