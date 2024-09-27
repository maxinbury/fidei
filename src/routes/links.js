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
const { busquedarenapet } = require('./funciones/buscarrenapet');

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
             //   console.log(error)
            }
}
}
    } catch (error) {
       // console.log(error)
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


router.get('/clientehabilitadoic3/:cuil_cuit',isLoggedInn2, async (req, res) => {
    const { cuil_cuit } = req.params
 
    const links = await pool.query('SELECT * FROM clientes WHERE id= ?', [cuil_cuit])

    const habilitado = await pool.query('SELECT * FROM registro_operaciones WHERE cuil_cuit_referencia = ? and (adicional = "Habilitado" or adicional = "Deshabilitado")', [links[0]['cuil_cuit']])

    if (habilitado.length>0){
    reg= habilitado[(habilitado.length)-1]
        }else{
            reg= {cuil_cuit:'Sistema',
            fecha: 'de su creacion'}

        }
    
    res.json([links,reg])

})
router.get('/clientehabilitado/:cuil_cuit',isLoggedInn2, async (req, res) => {
    const { cuil_cuit } = req.params
 
    const links = await pool.query('SELECT * FROM clientes WHERE cuil_cuit= ?', [cuil_cuit])
    const habilitado = await pool.query('SELECT * FROM registro_operaciones WHERE cuil_cuit_referencia = ? and (adicional = "Habilitado" or adicional = "Deshabilitado")', [cuil_cuit])

    if (habilitado.length>0){
    reg= habilitado[(habilitado.length)-1]
        }else{
            reg= {cuil_cuit:'Sistema',
            fecha: 'de su creacion'}

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
  cli = await pool.query ('select * from clientes where cuil_cuit = ?',[cuil_cuit])
    
mensaje= 'Hola como estas '

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

router.get('/listaic3', async (req, res) => {
 
    clientes = await pool.query('select * from clientes where zona = "IC3"')
    res.json(clientes)
}
)

router.post('/subirlegajodni', fileUpload, async (req, res, done) => {
    const { tipo, cuil_cuit } = req.body


    try {
      
        const type = req.file.mimetype
     
        const name = req.file.originalname
 
        const data = fs.readFileSync(path.join(__dirname, '../../pdfs/' + req.file.filename))
    

        const datos = {
            ubicacion: req.file.filename,
            tipo: tipo,
            cuil_cuit: cuil_cuit,
            estado: 'A',
        }
        await pool.query('insert into constancias set?', datos)
        res.send('Imagen guardada con exito')
    } catch (error) {
        res.send('algo salio mal')
    }
    // console.log(req.file)






})


const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('file'), (req, res) => {
    const filePath = path.join(__dirname, req.file.path);
    const workbook = xlsx.readFile(filePath);
  
    // Recorrer todas las hojas
    const sheetNames = workbook.SheetNames;
    const allData = [];
  
    sheetNames.forEach((sheetName) => {
      const worksheet = workbook.Sheets[sheetName];
      const sheetData = xlsx.utils.sheet_to_json(worksheet);
  
      sheetData.forEach((row) => {
        // Aquí puedes hacer algo con cada fila
        allData.push({ sheetName, row });
      });
    });
  
    // Eliminar el archivo subido después de procesarlo para no ocupar espacio innecesario
    fs.unlinkSync(filePath);
  
    // Aquí puedes hacer algo con los datos procesados
    console.log(allData);
  
    // Opcionalmente, puedes enviar los datos de vuelta al cliente
    res.json(allData);
  });




  router.get('/consultarenapet/', async (req, res) => {
 
    const name = await pool.query('select * from clientes')

    const axios = require('axios');
const cheerio = require('cheerio');

async function busquedarenapet(nombresArray) {
    try {
        // Realiza una solicitud GET para obtener el contenido de la página
        const url = 'https://repet.jus.gob.ar/';
        const response = await axios.get(url);
        const html = response.data;
        const $ = cheerio.load(html);

        // Convertir el contenido de la página en texto y dividirlo en líneas
        const pageText = $('body').text();
        const lines = pageText.split('\n').map(line => line.trim()).filter(line => line.length > 0);

        // Para almacenar resultados de cada nombre
        const allResults = [];

        // Iterar sobre cada objeto en el array de nombres
        for (const obj of nombresArray) {
            const Nombre = obj?.Nombre; // Verificar si el campo Nombre existe

            // Si no existe el Nombre o no es una cadena, continuar con el siguiente objeto
            if (!Nombre || typeof Nombre !== 'string') {
                console.warn('Nombre no válido:', Nombre);
                continue;
            }

            // Separar las palabras del nombre por espacios
            const nameParts = Nombre.split(' ').map(word => word.trim()).filter(word => word.length > 0);
            const matchedLines = [];

            // Buscar cada palabra del nombre en las líneas de la página
            lines.forEach(line => {
                let matchFound = false;

                // Verificar si al menos una palabra del nombre aparece en la línea
                nameParts.forEach(word => {
                    if (line.includes(word)) {
                        matchFound = true;
                    }
                });

                // Si se encontró al menos una coincidencia, agregar la línea
                if (matchFound) {
                    matchedLines.push(line);
                }
            });

            // Guardar resultados por nombre si hay coincidencias
            if (matchedLines.length > 0) {
                allResults.push({
                    Nombre,
                    coincidencias: matchedLines,
                });
            }
        }

        // Mostrar el total y los nombres con coincidencias
        if (allResults.length > 0) {
            console.log(`Total de nombres con coincidencias: ${allResults.length}`);
            console.log('Nombres que coinciden:');
            allResults.forEach(result => {
                console.log(`Nombre original: ${result.Nombre}`);
                console.log("Coincidencias:");
                result.coincidencias.forEach(line => {
                    console.log(`- ${line}`);
                });
                console.log('\n'); // Salto de línea entre cada nombre y sus coincidencias
            });
        } else {
            console.log('No se encontraron coincidencias para ninguno de los nombres.');
        }

        // Retornar solo los nombres con coincidencias y las líneas
        return allResults;
    } catch (error) {
        console.error('Error al buscar los nombres en la página:', error);
        return null;
    }
}

// Ejemplo de uso con un array de objetos
const nombresArray = [{ Nombre: "pipo gomez" }, { Nombre: "Maria lopez" }];

// Mostrar cada resultado con referencia al nombre original
busquedarenapet(nombresArray).then(result => {
    if (result && result.length > 0) {
        result.forEach(entry => {
            console.log(`Nombre original: ${entry.Nombre}`);
            entry.coincidencias.forEach(line => {
                console.log(`Coincidencia: ${line}`);
            });
            console.log('\n'); // Salto de línea entre cada nombre y sus coincidencias
        });
    } else {
        console.log("No se encontraron coincidencias.");
    }
});



})

module.exports = router





