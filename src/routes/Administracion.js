const express = require('express')
const router = express.Router()
const pool = require('../database')
const XLSX = require('xlsx')
const { isLoggedIn,isLoggedInn2 } = require('../lib/auth') //proteger profile
const { isLevel2 } = require('../lib/authnivel2')
const {pendientes,aprobar, aprobarcomp,rechazar2, rechazarcomp,pendientestodas, rechazo, aprobacioncbu, aprobarcbu,rechazarcbu, rechazobu, postrechazocbu } = require('../contoladores/controladoraprobaciones')
const multer = require('multer')
const path = require('path')
const fs = require('fs')



const diskstorage = multer.diskStorage({
  destination: path.join(__dirname, '../Excel'),
  filename: (req, file, cb) => {
      cb(null,  Date.now() + '-estr-' + file.originalname)

  }
}) //para que almacene temporalmente la imagen
const fileUpload = multer({
  storage: diskstorage,

}).single('image')




router.post('/subirprueba', fileUpload, async (req, res, done) => {
  const {formdata, file} = req.body

try {
  

  const type = req.file.mimetype
  const name = req.file.originalname
 // const data = fs.readFileSync(path.join(__dirname, '../Excel' + req.file.filename))
  fech = (new Date(Date.now())).toLocaleDateString()

  const datos = {
    fecha: fech,
    ubicacion: req.file.filename/////ubicacion

      
  }
  await pool.query('insert into extracto set?', datos)
  res.send('Imagen guardada con exito')
} catch (error) {
  console.log(error)
}
  
  


})



// LISTA TODAS PENDIENTES PAra React
//   ver***
router.get('/borrar/:cuil_cuit', isLoggedInn2,  async (req, res) => {
    const { cuil_cuit } = req.params

    await pool.query('DELETE FROM clientes WHERE cuil_cuit = ?', [cuil_cuit])
   res.send('borrado')

})
///cargar estracto
router.get('/extracto',  async (req, res) => {
   

  try {
      
    etc = await pool.query('select * from extracto')
    nombre = etc[(etc.length)-1]['ubicacion']
    const workbook = XLSX.readFile('./src/Excel/'+nombre)

    const workbooksheets = workbook.SheetNames
    const sheet = workbooksheets[0]

    const dataExcel = XLSX.utils.sheet_to_json(workbook.Sheets[sheet])
    //console.log(dataExcel)

    let regex = /(\d+)/g;
    let mandar =[]
    for (const property in dataExcel) {
    
       /*  if ((dataExcel[property]['Descripción']).includes(cuil_cuit)) {
            estado = 'A'
            // tipo de pago normal 
        } */
        console.log((dataExcel[property]['Descripción']).match(regex))
        descripcion = (dataExcel[property]['Descripción']).match(regex)
        referencia =dataExcel[property]['Referencia']
        debitos = dataExcel[property]['Débitos']
        creditos = dataExcel[property]['Créditos']
      nuevo={
        descripcion,
        referencia,
        debitos,
        creditos,

      }

      mandar.push(nuevo);

    }
    res.json(mandar)
     }
    catch (error) {
      console.log(error)
    }

   



})


module.exports = router
