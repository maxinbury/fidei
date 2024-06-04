const express = require('express')
const router = express.Router()

const path = require('path')
const fs = require('fs')
const multer = require('multer')

/// borrar despues
const XLSX = require('xlsx')
const pool = require('../database')


// Configuración de Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../documentos');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
  
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});



const upload = multer({ storage });




router.get('/', async (req, res) => {
  const auxs = await pool.query('Select * from chats')

  res.json(auxs);
//res.render('index')
})

router.get('/logueado', async (req, res) => {
  res.json(req.user);


})

router.get('/estalogeado', async (req, res) => {
  let  aux = req.user

  if (aux === undefined ) {
    logueado= false

  }else {
    logueado= true
  }


res.json(logueado);
})

router.get('/ingresartexto', async (req, res) => {

res.json(2);
})

router.get('/traerPdfConstanciadepago/:id',async (req, res) => {
  const { id } = req.params;
  console.log(id)
  const query = await pool.query('SELECT * FROM pagos WHERE id = ?',[id]);
console.log(query)

    const filePath = path.join(__dirname, '../documentos', query[0].ubicacion);
    res.sendFile(filePath);
  ;
});
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
  if (!input.files || input.files.length === 0) {
    console.error('No se seleccionó ningún archivo.');
    return;
  }

  // Obtener el primer archivo seleccionado
  const archivo = input.files[0];

  // Crear un objeto FileReader
  const lector = new FileReader();

  // Configurar el evento de carga del lector
  lector.onload = function (e) {
    // El contenido del archivo está en e.target.result
    const contenido = e.target.result;

    // Aquí puedes hacer lo que quieras con el contenido del archivo
    console.log('Contenido del archivo:', contenido);

    // Ejemplo: Dividir el contenido en líneas
    const lineas = contenido.split('\n');
    console.log('Número de líneas:', lineas.length);
    console.log('Líneas del archivo:', lineas);
  };

  // Configurar el evento de error del lector
  lector.onerror = function (e) {
    console.error('Error al leer el archivo:', e.target.error);
  };

  // Leer el contenido del archivo como texto
  lector.readAsText(archivo);
}

// Uso: Asociar esta función con el evento onChange de un input de tipo file
const inputArchivo = document.getElementById('tuInputFileId'); // Reemplaza con tu ID de input file
inputArchivo.addEventListener('change', function () {
  leerArchivo(this);
}
  */







module.exports = router