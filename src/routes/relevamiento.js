const express = require('express')
const router = express.Router()
const pool = require('../database')
const path = require('path')
const fs = require('fs')
const multer = require('multer')
const XLSX = require('xlsx')


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Carpeta donde se guardarán los archivos subidos
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });


function convertExcelDate(excelDate) {
  const date = new Date((excelDate - (25567 + 1)) * 86400 * 1000);
  return date.toISOString().split('T')[0];
}


router.post('/subirexcel', upload.single('excel'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No se ha subido ningún archivo');
  }

  const filePath = req.file.path;
  const workbook = XLSX.readFile(filePath);

  const columns = [
    'Cuota', 'Mes', 'Saldo de Inicio', 'Ajuste por ICC', 'Amortización',
    'Base cálculo ajuste', 'Ajuste', 'Cuota Con Ajuste', 'Pago', 'Excedente',
    'IVA S/ajuste', 'Saldo al Cierre', 'SALDO ACUM.'
  ];

  for (let i = 0; i < workbook.SheetNames.length; i++) {
    const sheetName = workbook.SheetNames[i];
    const worksheet = workbook.Sheets[sheetName];

    const cellC2 = worksheet['C2'];
    console.log(worksheet['C2']);
    let cliente = '';
    try {
      // cliente = await pool.query('select * from clientes where Nombre=?', [worksheet['C2'] ? worksheet['C2'].v : '']);
    } catch (error) {
      console.error(error);
    }

    if (cellC2 && cellC2.v !== undefined) {
      console.log(`Contenido de la celda C2 en la hoja "${sheetName}": ${cellC2.v}`);
    } else {
      console.log(`No se encontró contenido en la celda C2 en la hoja "${sheetName}"`);
    }

    let columnIndices = {};
    for (const cellAddress in worksheet) {
      const cell = worksheet[cellAddress];
      if (cell && cell.t === 's' && columns.includes(cell.v)) {
        const column = cell.v;
        const columnIndex = XLSX.utils.decode_cell(cellAddress).c;
        columnIndices[column] = columnIndex;
        console.log(`Hoja: "${sheetName}"`);
        console.log(`${column}:`);
        
        const rowIndex = XLSX.utils.decode_cell(cellAddress).r;
        for (let row = rowIndex + 1; ; row++) {
          const rowValues = [];
          const rowObject = { SheetName: sheetName }; // Incluir el nombre de la hoja
          let hasData = false;
          for (const col of columns) {
            const cellValue = worksheet[XLSX.utils.encode_cell({ r: row, c: columnIndices[col] })];
            if (!cellValue) continue;

            let value;
            if (col === 'Mes' && cellValue.t === 'n') {
              // Solo convertir fechas en la columna 'Mes'
              try {
                value = convertExcelDate(cellValue.v);
              } catch (e) {
                value = cellValue.v;
              }
            } else {
              value = cellValue.v;
            }
            console.log(`${col}: ${value}`);
     rowValues.push(`${col}: ${value}`);
            rowObject[col.replace(/\s+/g, '')] = value; // Guardar el valor en el objeto fila sin espacios
            hasData = true;
          }

          if (hasData) {
            console.log(rowValues.join(', '));
            console.log('probando2')
            // Insertar la fila en la base de datos, incluyendo el nombre de la hoja
            try {
              if ( rowObject['Amortización'] != undefined && rowObject['IVAS/ajuste'] != undefined ){
           /*    console.log(
                rowObject['SheetName'],
                rowObject['Cuota'],
                rowObject['Mes'],
                rowObject['SaldodeInicio'],
                rowObject['AjusteporICC'],
                rowObject['Amortización'],
                rowObject['Basecálculo'],
                rowObject['Ajuste'],
                rowObject['CuotaConAjuste'],
                rowObject['Pago'],
                rowObject['Excedente'],
                rowObject['IVAS/ajuste'],
                rowObject['SaldoalCierre'],
                rowObject['SALDOACUM.']
              );
          */ let ex= await pool.query('select * from cuotas_ic3 where cuota=? and nombre=?',[
                  rowObject['Cuota'],
                
                  rowObject['SheetName'],
                
                ])
                if (ex.length>0){
                  console.log('yacargado')
                }else{
              await pool.query(
                `INSERT INTO cuotas_ic3 (cuota, mes, saldo_inicial, ajuste_icc, amortizacion, base_calculo, ajuste, cuota_con_ajuste, nombre, iva) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                  rowObject['Cuota'],
                  rowObject['Mes'],
                  rowObject['SaldodeInicio'],
                  rowObject['AjusteporICC'],
                  rowObject['Amortización'],
                  rowObject['Basecálculo'],
                  rowObject['Ajuste'],
                  rowObject['CuotaConAjuste'],
                  rowObject['SheetName'],
                  rowObject['IVAS/ajuste'],
                ]
              );
            }



              console.log('Fila insertada en la base de datos');}
            } catch (error) {
              console.error('Error insertando la fila en la base de datos:', error);
            }
          } else {
            break;
          }
        }
      }
    }
  }

  res.json({ success: true });
});



router.post('/subirexcellotes', upload.single('excel'), async (req, res) => {
  try {
    // Leer el archivo Excel
    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0]; // Suponiendo que hay solo una hoja en el archivo

    // Obtener los datos de la hoja
    const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    // Procesar los datos
    /*   const sheetData = sheetData.map(row => ({
        nombre: row.Nombre,
        apellido: row.Apellido
  
       ));    // Agrega más campos según las columnas que necesites procesar
      } */



    ///////////////////////////////////////////////////////////////////
    for (property in sheetData) {
      // a += 1
      ///////MES DE PAGO
      console.log(sheetData[property]['Mes'])
      console.log(sheetData[property]['Cuota'])
      ///actualizar



    }


    // Devolver los datos procesados como respuesta
    res.json('realizado');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al procesar el archivo Excel.');
  }
})










router.post("/datos", async (req, res) => {
  const { barrio } = req.body

  const datos = await pool.query('SELECT * FROM relevamiento where zona  = ?', [barrio])

  let cdenuncia = 0
  let sdenuncia = 0
  let enproceso = 0

  let uno = 0
  let dos = 0
  let tres = 0
  // console.log(datos[0]['Rango_Antiguedad'])
  for (var i = 0; i < datos.length; i++) {


    switch (datos[i]['Status']) {
      case "Denuncia":
        cdenuncia = cdenuncia + 1

        break;
      case "SinDenuncia":
        sdenuncia = sdenuncia + 1
        break;
      case "EnProceso":
        enproceso = enproceso + 1
        break;
      default:
        break;
    }
    switch (datos[i]['Rango_Antiguedad']) {
      case "0-4":
        uno = uno + 1

        break;
      case "4-8":
        dos = dos + 1
        break;
      case "8-12":
        tres = tres + 1
        break;
      default:
        break;
    }



  }
  porcD = (cdenuncia / datos.length * 100).toFixed(2)

  porcSD = (sdenuncia / datos.length * 100).toFixed(2)
  porcEP = (enproceso / datos.length * 100).toFixed(2)

  const status = {
    "familias": datos.length,

    "cdenuncia": cdenuncia,
    "porcDenuncia": porcD,

    "SinDenuncia": sdenuncia,
    "porcSDenuncia": porcSD,

    "EnProceso": enproceso,
    "porcEnProceso": porcEP

  }

  unoo = {
    rango: "0-4",
    cantidad: uno,
  }
  doss = {
    rango: "4-8",
    cantidad: uno,
  }
  tress = {
    rango: "8-12",
    cantidad: tres,
  }

  const rangoo = [unoo, doss, tress]

  const rta = [status, rangoo, datos]
  res.json(rta)


})


router.post("/nuevazona", async (req, res) => {
  const { zona } = req.body
  try {
    const nuev = {
      nombre: zona
    }
    await pool.query('INSERT INTO zonarelev SET ?', [nuev]);

    res.send('Guardado con exito')
  } catch (error) {
    res.send('Erro algo sucedio')
  }


})




router.post("/cargar", async (req, res) => {
  const { Zona, Material_Construccion, Status, Rango_Antiguedad, Observaciones, Familia } = req.body
  const newDato = {
    Zona, Material_Construccion, Status, Rango_Antiguedad, Observaciones, Familia
  }

  try {
    await pool.query('INSERT INTO relevamiento SET ?', [newDato]);
    res.send('Cargado correctamente!')
  } catch (error) {
    res.send('Algo Salio mal')
  }




})

router.post("/borrardatoszona", async (req, res) => {
  const { Zona } = req.body

  try {
    await pool.query('DELETE FROM relevamiento WHERE zona = ?', [Zona])
    res.send('Borrado correctamente!')
  } catch (error) {
    res.send('Algo Salio mal')
  }




})


router.get('/zonas', async (req, res) => {

  const zonass = await pool.query(" Select DISTINCT Zona from relevamiento ")

  res.json(zonas)
}

)

module.exports = router
