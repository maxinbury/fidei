const express = require('express')
const router = express.Router()
const pool = require('../database')
const { isLevel2 } = require('../lib/authnivel2')
const { isLoggedIn } = require('../lib/auth') //proteger profile
const XLSX = require('xlsx')







router.get("/completar_cuil_cuit", isLoggedIn, isLevel2, async (req, res) => {


    const lotes = await pool.query('select * from lotes')

    for (var i = 0; i < lotes.length; i++) {
        try {
            
       
        aux= '%'+lotes[i]['nombre_razon']+'%'
        console.log(aux)
         cliente = await pool.query('select * from clientes where Nombre like ?',[aux])
         console.log(cliente)
        cuil_cuit = cliente[0]['cuil_cuit']
        let neew = {cuil_cuit}

       id= lotes[i]['id']
         await pool.query('UPDATE lotes SET ? where id =?', [neew,id])

        } catch (error) {
            console.log(error)
        }
    }
    
    res.render('links/list', { links })
})






router.get('/cargar_movimientos', isLoggedIn, isLevel2, async (req, res) => {
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


module.exports = router


