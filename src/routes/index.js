const express = require('express')
const router = express.Router()




/// borrar despues
const XLSX = require('xlsx')
const pool = require('../database')

router.get('/', async (req, res) => {
  const auxs = await pool.query('Select * from chats')

  res.json(auxs);
//res.render('index')
})

router.get('/logueado', async (req, res) => {
console.log(req.user)
  res.json(req.user);

  
//res.render('index')
})

router.get('/estalogeado', async (req, res) => {
  let  aux = req.user

  if (aux === undefined ) {
    logueado= false

  }else {
    logueado= true
  }


console.log(logueado)
res.json(logueado);
})



  /* const cantidad = await pool.query('SELECT count(*) FROM pagos WHERE (cuil_cuit = 34825125 and lote = 1) ',[34825125, 1])
        const nro_cuota = cantidad[0]['count(*)'] + 1
        console.log(cantidad)
        console.log(nro_cuota)


 
  const workbook = XLSX.readFile('./src/Excel/cuentas_PosicionConsolidada.xls')
  const workbooksheets = workbook.SheetNames
  const sheet = workbooksheets[0]
  const dataExcel = XLSX.utils.sheet_to_json(workbook.Sheets[sheet])
  //console.log(dataExcel)
  const palabra = 'LEY'
  console.log(palabra.includes('LEY'))
  
  for (const property in dataExcel) {
     
    console.log((dataExcel[property]['Descripción']).includes('LEY'))

  }
  */







module.exports = router