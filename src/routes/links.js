const express = require('express')
const router = express.Router()
const pool = require('../database')
const { isLoggedIn, isLoggedInn2} = require('../lib/auth') //proteger profile
const { isLevel2 } = require('../lib/authnivel2')
const XLSX = require('xlsx')
const fs = require('fs')
const multer = require('multer')
const path = require('path')
const sacarguion = require('../public/apps/transformarcuit')
const nodemailer = require("nodemailer");
/* const aws = require ('aws-sdk')
/////////aws
aws.config.update({
    secretAccessKey: "4ShxwNJR7g4D7x+9NW6/gTjL6WbwHNea5Ig6JvLu",
    accessKeyId: 'AKIAVMDPHXOO7ETOD76L',
    region: "sa-east-1",

});
const BUCKET = "mypdfstorage"
const s3 = new aws.S3();

const upload = multer({
    storage: multerS3({
        s3: s3,
        acl: "public-read",
        bucket: BUCKET,
        key: function (req, file, cb) {
            console.log(file);
            cb(null, file.originalname)
        }
    })
}) */


//Prueba demandar  mail

router.get('/enviarmailprueba/',isLoggedInn2, async (req, res) => {
   // const cuil_cuit = req.params.cuil_cuit
    //  fs.writeFileSync(path.join(__dirname,'../dbimages/'))

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
        from: '"Fred Foo 👻" <fideicomisoSCatalina@outlook.com>', // sender address
        to: "pipao.pipo@gmail.com", // list of receivers
        subject: "Hellozzzz ✔", // Subject line
        text: "Hello world?", // plain text body
        html: "<b>Hello world?</b>", // html body
      });
    
      console.log("Message sent: %s", info.messageId);
      // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
    
      // Preview only available when sending through an Ethereal account
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
   

    /*  legajos.map(img => {
          fs.writeFileSync(path.join(__dirname, '../dbimages/' + img.id + '--.png'), img.comprobante)
  
      })
      const imagedir = fs.readdirSync(path.join(__dirname, '../dbimages/'))*/
   // res.json(legajos)


})
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




router.post('/agregaringreso', isLevel2, async (req, res) => {
    const { id, ingresos, cuil_cuit } = req.body
    console.log(cuil_cuit)
    const newLink = {
        ingresos
    }
    try {
        await pool.query('UPDATE clientes set ? WHERE id = ?', [newLink, id])

    } catch (error) {
        console.log(error)

    }



    res.redirect('/links/detallecliente/' + cuil_cuit)


})
router.post('/habilitar',isLoggedInn2, async (req, res) => {
    const { cuil_cuit, cuil_cuit_admin } = req.body
    console.log(cuil_cuit)
    newLink = {
        habilitado: 'Si'
    }
    newLink2 = {
        cuil_cuit: cuil_cuit_admin,
        tabla_referencia:'clientes',
        cuil_cuit_referencia:cuil_cuit,
        fecha:(new Date(Date.now())).toLocaleDateString(),
        adicional:'Habilitado'
    }
    try {
        await pool.query('UPDATE clientes set ? WHERE cuil_cuit = ?', [newLink, cuil_cuit])
        await pool.query('insert registro_operaciones  set ?', newLink2)


    } catch (error) {
        console.log(error)

    }



    res.send('exito')


})
router.post("/estadisticaslegajos", isLoggedInn2,async (req, res) => {
    const { cuil_cuit } = req.body
    console.log(cuil_cuit)
    const legajos = await pool.query('SELECT * FROM constancias where  cuil_cuit =?', [cuil_cuit])
    const legajosAprobados = await pool.query('SELECT * FROM constancias where  cuil_cuit =? and estado="Aprobada"', [cuil_cuit])
   const cui =  '%'+cuil_cuit+'%'
    const client = await pool.query('select * from clientes where cuil_cuit like ? ',[cui])
    razon = client[0]['razon']

    a = "Dni "
    b = "Constancia de Afip "
    c = "Estatuto Social "
    d = "Acta del organo decisorio "
    e = "Acreditacion Domicilio "
    f = "Ultimos balances "
    g = "Dj Iva "
    h = "Pagos Previsionales "
    aux = "Dj Datos personales "
    j = "Dj CalidadPerso "
    k = "Dj Origen de Fondos "
    l = "Acreditacion de ingresos "
    m = "Referencias comerciales"

    aa = 0
    bb = 0
    cc = 0
    dd = 0
    ee = 0
    ff = 0
    gg = 0
    hh = 0
    auxaux = 0
    jj = 0
    kk = 0
    ll = 0
    mm = 0



    for (var i = 0; i < legajosAprobados.length; i++) {
       
    if (razon == 'Empresa'){
        switch (legajosAprobados[i]['tipo']) {
            case "Dni":
                a = ""
                aa = 1
                break;
            case "Constancia de Afip":
                b = ""
                bb = 1
                break;
            case "Estatuto Social":
                c = ""
                cc = 1

                break;
            case "Acta del organo decisorio":
                d =""
                dd = 1
                break;
            case "Acreditacion Domicilio":
                e = ""
                ee = 1
                break;
            case "Ultimos balances":
                f = ""
                ff = 1
                break;
            case "DjIva":
                g = ""
                gg = 1

                break;
            case "Pagos Previsionales":
                h = ""
                hh = 1
                break;
            case "Dj Datospers":
                aux = ""
                auxaux = 1
                break;
            case "Dj CalidadPerso":
                j = ""
                jj = 1
                break;
            case "Dj OrigenFondos":
                k = ""
                kk = 1
                break;
                case "Referencias comerciales":
                    m = ""
                    mm = 1
                    break;
            default:
                break;
        }
    }else{
        switch (legajosAprobados[i]['tipo']) {
            case "Dni":
                a = ""
                aa = 1
                break;
            case "Constancia de Afip":
                b = ""
                bb = 1
                break;
          
            case "Acreditacion Domicilio":
                e = ""
                ee = 1
                break;
            
            case "Dj Datospers":
                aux = ""
                auxaux = 1
                break;
            case "Dj CalidadPerso":
                j = ""
                jj = 1
                break;
            case "Dj OrigenFondos":
                k = ""
                kk = 1
                break;
                case "Acreditacion de ingresos":
                    l = ""
                    ll = 1
                    break;
            default:
                break;
        }


    }

    }
   
 
 if (razon == 'Empresa'){
    Faltan ='Aun falta completar '+ a+b+c+d+e+f+g+h+aux+j+k+m
    porccompleto = (aa + bb + cc + dd + ee + ff + gg + hh + auxaux + jj+ kk+mm) 

    porccompleto= porccompleto/12
  
    porccompleto=( porccompleto*100).toFixed(2)
 }else {
    console.log('Persona')
    Faltan ='Aun falta completar '+ a+b+e+aux+j+k+l
    porccompleto = (aa + bb +  ee +  auxaux + jj+ kk+ll) 

    porccompleto= porccompleto/7
  
    porccompleto=( porccompleto*100).toFixed(2)
 }
   console.log(ll)

    let pendientes = 0
    let aprobadas = 0
    let rechazadas = 0

    let uno = 0
    let dos = 0
    let tres = 0


    for (var i = 0; i < legajos.length; i++) {


        switch (legajos[i]['estado']) {
            case "Pendiente":
                pendientes = pendientes + 1

                break;
            case "Aprobada":
                aprobadas = aprobadas + 1
                break;
            case "Rechazada":
                rechazadas = rechazadas + 1
                break;
            default:
                break;
        }



    }
    if (0 < legajos.length) {
        porcP = (pendientes / legajos.length * 100).toFixed(2)

        porcA = (aprobadas / legajos.length * 100).toFixed(2)
        porcR = (rechazadas / legajos.length * 100).toFixed(2)
    } else {
        porcP = 0
        porcA = 0
        porcR = 0
    }
 
  

    const status = {
        "total": legajos.length,

        "Pendientes": pendientes,
        "porcPendientes": porcP,

        "Aprobadas": aprobadas,
        "porcAprobadas": porcA,

        "Rechazadas": rechazadas,
        "porcRechazadas": porcR,

        porccompleto,
        Faltan

    }

    /*  unoo = {
         rango: "0-4",
         cantidad: uno,
     }
     doss={
         rango: "4-8",
         cantidad: uno, 
     }
     tress={
         rango: "8-12",
         cantidad: tres,
      }
     
      const rangoo =[unoo,doss,tress] */

    // const rta =[status,rangoo,datos]
    const rta = [status]

    res.json(rta)


})

router.post('/deshabilitar',isLoggedInn2, async (req, res) => {
    const { cuil_cuit,cuil_cuit_admin} = req.body

    newLink = {
        habilitado: 'No'
    }
    newLink2 = {
        cuil_cuit: cuil_cuit_admin,
        tabla_referencia:'clientes',
        cuil_cuit_referencia:cuil_cuit,
        fecha:(new Date(Date.now())).toLocaleDateString(),
        adicional:'Deshabilitado'
    }
    try {
        await pool.query('UPDATE clientes set ? WHERE cuil_cuit = ?', [newLink, cuil_cuit])
        await pool.query('insert registro_operaciones  set ?', newLink2)
    } catch (error) {
        console.log(error)

    }



    res.send('exito')


})
////////////inicio carga de legajos manual Total 11
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


router.post('/subirlegajoprueba', fileUpload, async (req, res, done) => {
    const { tipo, legform } = req.body
    console.log('hola')
    console.log(tipo)
    console.log(legform)

    /*const type = req.file.mimetype
    const name = req.file.originalname
    const data = fs.readFileSync(path.join(__dirname, '../../pdfs/' + req.file.filename))

    const datos = {
        descripcion: name
    }
    try {
        await pool.query('insert into constancias set?', datos)
        res.send('Imagen guardada con exito')

    } catch (error) {
        res.send('algo salio mal')
    }*/


})

///// Funcion devuelve cantidad de clientes /// agregar 
router.get('/infocantidad',isLoggedInn2,  async (req, res) => {
 
    
    const clientes = await pool.query('select * from clientes' )
 

   
console.log(clientes.length)

    res.json(clientes)


})



router.get('/cbuspendientes', isLoggedInn2, async (req, res) => {
 
    //  fs.writeFileSync(path.join(__dirname,'../dbimages/'))


    const cbus = await pool.query('select * from cbus where estado="P"', )

    /*  legajos.map(img => {
          fs.writeFileSync(path.join(__dirname, '../dbimages/' + img.id + '--.png'), img.comprobante)
  
      })
      const imagedir = fs.readdirSync(path.join(__dirname, '../dbimages/'))*/
    res.json(cbus)


})



//lista legajos de un cliente 
router.get('/legajos/:cuil_cuit',isLoggedInn2, async (req, res) => {
    const cuil_cuit = req.params.cuil_cuit
    //  fs.writeFileSync(path.join(__dirname,'../dbimages/'))


    const legajos = await pool.query('select * from constancias where cuil_cuit =?', [cuil_cuit])

    /*  legajos.map(img => {
          fs.writeFileSync(path.join(__dirname, '../dbimages/' + img.id + '--.png'), img.comprobante)
  
      })
      const imagedir = fs.readdirSync(path.join(__dirname, '../dbimages/'))*/
    res.json(legajos)


})



//Asignar lote a usuario 
router.post('/ventalotee',isLoggedInn2, async (req, res) => {
    let { zona, manzana, fraccion, parcela, cuil_cuit, lote, estado } = req.body



    switch (zona) {
        case 'PIT':

            lote = '0'
            break;
        case 'IC3':
            parcela = '0'
            //  fraccion = fraccion.toUpperCase()
            break;


    }


    venta = {
        cuil_cuit,
        estado

    }

    try {
        if (zona = 'PIT') {
            // fraccion=?, manzana =?, parcela =?, lote=? 


            const existe = await pool.query('select * from lotes where zona=? and fraccion =? and manzana =? and parcela=? and lote =?', [zona, fraccion, manzana, parcela, lote])
            console.log(existe)
            if (existe.length > 0) {

                console.log(existe[0]['id'])
                await pool.query('UPDATE lotes set ? WHERE id = ?', [venta, existe[0]['id']])
                console.log('Lote asignado')
                res.send('Lote asignado')
            } else { res.send('No existe el lote') }


            // res.render('links/ventalote', { cliente })
        }else{
            const existe = await pool.query('select * from lotes where zona=? and fraccion =? and manzana =? and  lote =?', [zona, fraccion, manzana, parcela, lote])
            console.log(existe)
            if (existe.length > 0) {

                console.log(existe[0]['id'])
                await pool.query('UPDATE lotes set ? WHERE id = ?', [venta, existe[0]['id']])
                console.log('Lote asignado')
                res.send('Lote asignado')
            } else { res.send('No existe el lote') }


        }

    } catch (error) {
        console.log(error)
        res.send('algo salio mal')
    }
})

////react 
router.post('/add2',isLoggedInn2, async (req, res) => {
    const { Nombre, tipo_dni, domicilio, cuil_cuit, razon, telefono, observaciones } = req.body;
    const newLink = {
        Nombre,
        tipo_dni,
        razon,
        telefono,
        domicilio,
        observaciones,
        cuil_cuit
        //user_id: req.user.id
    };



    try {
        const row = await pool.query('Select * from clientes where cuil_cuit = ?', [req.body.cuil_cuit]);
        if (row.length > 0) {   // SI YA EXISTE EL CLIENTE
            res.send('Error cuil_cuit ya existe')

        }
        else {
            await pool.query('INSERT INTO clientes set ?', [newLink]);
            res.send('Guardado correctamente')

        }

    } catch (error) {
        console.log(error)
        res.send('message', 'Error algo salio mal')


    }





})


/////////

router.get('/cargar_todos_legales', async (req, res) => {
    console.log("entra")
    const workbook = XLSX.readFile('./src/Excel/Listado expedientes Barrios.xlsx')
    const workbooksheets = workbook.SheetNames
    const sheet = workbooksheets[0]

    const dataExcel = XLSX.utils.sheet_to_json(workbook.Sheets[sheet])
    //console.log(dataExcel)


    var a = 1
    for (const property in dataExcel) {
        a += 1
        aux = dataExcel[property]['Número']



        obs = dataExcel[property]['Observaciones']



        try {
            const newLink = {
                id: dataExcel[property]['Cód. cliente'],
                Exp: dataExcel[property]['EXP.'],
                L: dataExcel[property]['L.'],
                Anio: dataExcel[property]['AÑO'],

                Expediente: dataExcel[property]['EXP.'] + '-' + dataExcel[property]['L.'] + '-' + dataExcel[property]['AÑO'],
                Iniciador: dataExcel[property]['INICIADOR'],
                Extracto: dataExcel[property]['EXTRACTO'],
                Cpos: dataExcel[property]['Cpos.'],

                Fjs: dataExcel[property]['Fjs.'],
                Barrio: 'IB6',
                Observacion: dataExcel[property]['OBSERVACION'],
                Rev: dataExcel[property]['REV.'],
                Resp: dataExcel[property]['RESP.'],
                Caratula: dataExcel[property]['CARÁTULA'],

            }



            await pool.query('INSERT INTO expedientes set ?', [newLink]);




        } catch (e) {
            console.log(e)
        }

        /* if ((dataExcel[property]['Sucursal']).includes(cuil_cuit)) {
            estado = 'A'
        }*/

    }





    res.redirect('/links/clientes')
})
/////

//  LEER Y CARGAR DEL EXCEL LOS CLIENTES DEL TANGO. NO CONECTAR
router.get('/cargar_todos', isLoggedIn, isLevel2, async (req, res) => {
    console.log("entra")
    const workbook = XLSX.readFile('./src/Excel/Base de Clientes TANGO 04-22.xlsx')
    const workbooksheets = workbook.SheetNames
    const sheet = workbooksheets[0]

    const dataExcel = XLSX.utils.sheet_to_json(workbook.Sheets[sheet])
    //console.log(dataExcel)



    var a = 1
    for (const property in dataExcel) {
        a += 1
        aux = dataExcel[property]['Número']
        console.log(aux)
        cuil_cuit = 0
        try {
            cuil_cuit = aux.replace(/\s+/g, '')
        } catch (error) {
            console.log(error)
        }

        obs = dataExcel[property]['Observaciones']
        console.log(obs)
        try {




            observaciones = obs.replace(/\s+/g, '')
            a = observaciones.replace('F', '')
            b = a.replace('M', '')
            a = b.replace('L', '')
            cadena = a.split('-');
            fraccion = cadena[1]
            manzana = cadena[2]
            lote = cadena[3]

            cargarcuit = {
                cuil_cuit
            }
            await pool.query('UPDATE lotes set ? WHERE manzana = ? lote = ? fraccion = ?', [cargarcuit, manzana, lote, fraccion])

        } catch (error) {
            console.log(error)
        }

        try {
            const newLink = {
                id: dataExcel[property]['Cód. cliente'],
                razon_social: dataExcel[property]['Razón social'],
                nombre: dataExcel[property]['Nombre comercial'],
                tipo_dni: dataExcel[property]['Tipo de documento'],
                domicilio: dataExcel[property]['Domicilio'],
                cuil_cuit,
                localidad: dataExcel[property]['Localidad'],
                cp: dataExcel[property]['Cód. Postal'],
                telefono: dataExcel[property]['Teléfono'],
                movil: dataExcel[property]['Móvil'],
                email: dataExcel[property]['E-mail'],
                responsable_del_pago: dataExcel[property]['Responsable del pago'],
                cod_provincia: dataExcel[property]['Cód. provincia'],
                provincia: dataExcel[property]['Provincia'],
                cod_zona: dataExcel[property]['Cód. de Zona'],
                zona: dataExcel[property]['Zona'],
                condicion_de_iva: dataExcel[property]['Condición de IVA'],
                condicion_de_venta: dataExcel[property]['Sucursal'],
                descripcion_cond_de_venta: dataExcel[property]['Descripción Condición de Venta'],
                porc_bonificacion: dataExcel[property]['% de bonificación'],
                clausula_moneda_extranjera: dataExcel[property]['Cláusula moneda extranjera'],
                fecha_alta: dataExcel[property]['Fecha de alta'],
                Inhabilitado: dataExcel[property]['Inhabilitado'],
                RG_1817: dataExcel[property]['RG 1817'],
                otros_impuestos: dataExcel[property]['Otros impuestos'],
                iva_liberado_habitual: dataExcel[property]['I.V.A. liberado (habitual)'],
                percepcion_ib: dataExcel[property]['Percepción IB (habitual)'],
                percepcion_ib_bs_as_59_98: dataExcel[property]['Percep. IB. Bs.AS. 59/98 (habitual)'],
                direcciones_de_entrega: dataExcel[property]['Direcciones de entrega'],
                observaciones,
                idiomas_comprobantes: dataExcel[property]['Idioma Comprobantes de Exportación'],
                incluye_comentarios_de_articulos: dataExcel[property]['Incluye Comentarios de los Artículos'],
                debitos_por_mora: dataExcel[property]['Débitos por mora'],
                empresa_vinculada: dataExcel[property]['Empresa vinculada'],
                inhabilitado_nexo_cobranzas: dataExcel[property]['Inhabilitado nexo Cobranzas'],
                id_lote_nombre: dataExcel[property]['Identificación Lote (Adic.)'],

            }


            let auxiliarid = await pool.query('select * from clientes  where cuil_cuit = ?', [aux])
            try {
                if (auxiliarid.length > 0) {
                    //hacer la carga al manzanero
                } else {
                    await pool.query('INSERT INTO clientes set ?', [newLink]);
                }


            } catch (error) {
                console.log(error)
            }



        } catch (e) {
            console.log(e)
        }

        /* if ((dataExcel[property]['Sucursal']).includes(cuil_cuit)) {
            estado = 'A'
        }*/

    }





    res.redirect('/links/clientes')
})


//    --------------------------------------------------------CREAR CLIENTE---------
//            CRER/agregar CLIENTE -------PANTALLA FORMULARIO---  ACTUALIZAR
router.get('/add', isLoggedIn, isLevel2, (req, res) => {

    res.render('links/add')

})
// METODO DE GUARDAR CLIENTE NUEVO
router.post('/add', isLoggedIn, isLevel2, async (req, res) => {
    const { Nombre, tipo_dni, domicilio, cuil_cuit, razon, telefono, observaciones, movil } = req.body;
    const newLink = {
        Nombre,
        movil,
        tipo_dni,
        razon,
        telefono,
        domicilio,
        observaciones,
        cuil_cuit
        //user_id: req.user.id
    };



    try {
        const row = await pool.query('Select * from clientes where cuil_cuit = ?', [req.body.cuil_cuit]);
        if (row.length > 0) {   // SI YA EXISTE EL CLIENTE
            req.flash('message', 'Error cuil_cuit ya existe')
            res.redirect('/links/clientes')
        }
        else {
            await pool.query('INSERT INTO clientes set ?', [newLink]);
            req.flash('success', 'Guardado correctamente')
            res.redirect('/links/clientes')
        }

    } catch (error) {
        console.log(error)
        req.flash('message', 'Error algo salio mal')
        res.redirect('/links/clientes')

    }





})


//    ------------------------------------------- FIN-CREAR CLIENTE----------------------

// -------------------------- BUSQUEDA DE CLIENTES
//BUSQUEDA POR CUIL
// /METODO INTERNO DE BUSQUEDA POR CUIL_CUIT, RECIBE, BUSCA LOS QUE COINCIDEN Y REDIRECCIONA A LISTA FILTRADA

// BUSCAR CLIENTE POR CUIL_CUIT  ---------
router.post('/listacuil_cuit', isLoggedIn, isLevel2, async (req, res, next) => {
    var { cuil_cuit } = req.body

    if (cuil_cuit == []) {
        res.redirect('/links/clientes/todos')
    } else {
        aux = '%' + cuil_cuit + '%'


        const rows = await pool.query('SELECT * FROM clientes WHERE cuil_cuit like ?', [aux])



        if (rows.length > 0) {

            res.redirect(`/links/busquedacuil/${cuil_cuit}`)


        } else {
            req.flash('message', 'Error, cuil/cuit no encontrado ')
            res.redirect('clientes')
        }
    }
})



router.get("/busquedacuil/:cuil_cuit", isLoggedIn, isLevel2, async (req, res) => {  //RECIBE EL CUIT DEL POST
    const cuil_cuit = req.params.cuil_cuit // requiere el parametro id

    aux = '%' + cuil_cuit + '%'
    const links = await pool.query('SELECT * FROM clientes WHERE cuil_cuit like ?', [aux]) //[req.user.id]
    console.log(links)

    /*
        Contar cuantos encontro
        dividir por 10
        70


    */



    res.render('links/list', { links })
})











// RECEPCION DE PARAMETROS DE APELLIDO Y FILTRO 
router.post('/listapp', isLoggedIn, isLevel2, async (req, res, next) => {
    const { app } = req.body
    if (app == []) {
        res.redirect('/links/clientes/todos')
    } else {


        aux = '%' + app + '%'
        try {
            const rows = await pool.query('SELECT * FROM clientes WHERE Nombre like ?', [aux])

            if (rows.length > 0) {
                res.redirect(`/links/app/${app}`)


            } else {
                req.flash('message', 'Error, Apellido no encontrado ')
                res.redirect('clientes')
            }
        } catch (error) {
            console.log(error)
            res.redirect('clientes')

        }
    }

})

//METODO INTERNO DE BUSQUEDA POR APELLIDO, RECIBE, BUSCA LOS QUE COINCIDEN Y REDIRECCIONA A LISTA FILTRADA
router.get("/app/:app", isLoggedIn, isLevel2, async (req, res) => {
    const app = req.params.app // requiere el parametro id 
    aux = '%' + app + '%'

    const links = await pool.query('SELECT * FROM clientes WHERE Nombre like ?', [aux]) //[req.user.id]
    res.render('links/list', { links })
})



// ----------------------------FIN BUSQUEDA DE CLIENTES






// MOSTRAR TODOS LOS CLIENTES---  FALTA LA PAGINACION
router.get('/clientes/todos', isLoggedIn, isLevel2, async (req, res) => {
    const links = await pool.query('SELECT * FROM clientes ')

    res.render('links/todos', { links })

})

router.get('/clientes', isLoggedIn, isLevel2, (req, res) => {

    res.render('links/busqueda')

})






//PAGINA DE EDICION DE MODIFICACION DE CLIENTES --- CONTROLAR

router.get('/edit/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params
    const links = await pool.query('SELECT * FROM clientes WHERE id= ?', [id])

    res.render('links/edit', { link: links[0] })

})

// PAGINA DE EDICION DE CLIENTE
router.post('/edit/:id', isLevel2, async (req, res) => {
    const { id } = req.params
    const { Nombre, Apellido, domicilio } = req.body
    const newLink = {
        Nombre,
        Apellido,
        domicilio
    }
    await pool.query('UPDATE clientes set ? WHERE id = ?', [newLink, id])

    req.flash('success', 'Cliente modificado correctamente')
    res.redirect('/links')
})





// METODO DE BORRAR -- REDIRECCION
router.get('/delete/:id', isLoggedIn, isLevel2, async (req, res) => {
    const { id } = req.params.id
    await pool.query('DELETE FROM clientes WHERE ID = ?', [id])
    req.flash('success', 'Cliente eliminado')
    res.redirect('/links')
})




// VER EL DETALLE DE CLIENTE--
router.get("/detallecliente/:cuil_cuit", isLoggedIn, isLevel2, async (req, res) => {  // DETALLE DE CLIENTE RECIBE EL ID
    let { cuil_cuit } = req.params
    let aux = '%' + cuil_cuit + '%'
    const links = await pool.query('SELECT * FROM clientes WHERE cuil_cuit like  ?', [aux])
    const cuotas = await pool.query('SELECT * FROM cuotas WHERE parcialidad = "Final" and cuil_cuit like  ?', [aux])
    let cuota = {

    }
    try {


        for (var i = 0; i < cuotas.length; i++) {
            cuotaa = cuotas[i]


        }
        cuota = {
            cuotaa
        }
    } catch (error) {


    }
    cuil_cuit = sacarguion.sacarguion(cuil_cuit)

    const usuarios = await pool.query('SELECT * FROM users WHERE cuil_cuit = ?', [cuil_cuit])



    if ((req.user.nivel > 2) && (usuarios.length > 0)) {

        if (usuarios[0]['habilitado'] == "SI") {
            habilitar = {
                cuil_cuit: usuarios[0]['cuil_cuit']

            }
            deshabilitar = {}
            habilitar = [habilitar]
            console.log(habilitar)
        } else {
            deshabilitar = {
                cuil_cuit: usuarios[0]['cuil_cuit']
            }
            habilitar = {}
            deshabilitar = [deshabilitar]
        }

        console.log(cuota)
        res.render('nivel3/detalleclientenivel3', { links, usuarios, cuota, habilitar, deshabilitar })

    } else {
        console.log("nivel2")
        res.render('links/detallecliente', { links, usuarios, cuota })
    }


})



//  PAGINA DE AGREGAR INGRESO DECLARADO
router.get('/agregaringreso/:cuil_cuit', isLoggedIn, isLevel2, async (req, res) => {
    const { cuil_cuit } = req.params
    aux = '%' + cuil_cuit + '%'
    const cliente = await pool.query('select * from clientes where cuil_cuit like ?', aux)


    res.render('links/agregaringreso', { cliente })
})
//////////vender un lote
router.get('/ventalotepit/:cuil_cuit', isLoggedIn, isLevel2, async (req, res) => {
    const { cuil_cuit } = req.params
    aux = '%' + cuil_cuit + '%'
    const cliente = await pool.query('select * from clientes where cuil_cuit like ?', aux)



    res.render('links/ventalote', { cliente })
})
router.post('/ventalotepit/', isLoggedIn, isLevel2, async (req, res) => {
    const { zona, manzana, parcela, cuil_cuit } = req.body
    console.log(cuil_cuit)
    venta = {
        cuil_cuit
    }
    try {

        // fraccion=?, manzana =?, parcela =?, lote=? 
        const existe = await pool.query('select * from lotes where zona=?  and manzana =? and parcela=? ', [zona, manzana, parcela])
        if (existe.length > 0) {
            console.log(existe)
            await pool.query('UPDATE lotes set ? WHERE id = ?', [venta, existe[0]['id']])
            res.redirect('/links/detallecliente/' + cuil_cuit)

        } else { console.log('no existe') }
        req.flash('Lote no xiste')
        res.redirect('/links/ventalote/' + cuil_cuit)

        // res.render('links/ventalote', { cliente })


    } catch (error) {

    }
})



router.post('/agregaringreso', isLevel2, async (req, res) => {
    const { id, ingresos, cuil_cuit } = req.body
    console.log(cuil_cuit)
    const newLink = {
        ingresos
    }
    try {
        await pool.query('UPDATE clientes set ? WHERE id = ?', [newLink, id])

    } catch (error) {
        console.log(error)

    }



    res.redirect('/links/detallecliente/' + cuil_cuit)


})
router.post('/agregaringreso2',isLoggedInn2, async (req, res) => {
    const { ingresos, cuil_cuit } = req.body
    console.log(cuil_cuit)
    console.log(ingresos)
    const newLink = {
        ingresos
    }
    try {
        await pool.query('UPDATE clientes set ? WHERE cuil_cuit = ?', [newLink, cuil_cuit])

    } catch (error) {
        console.log(error)

    }



    res.send('exito')


})
////////////////////////////////


router.get("/algo/prueba", async (req, res) => {
    links = ('')
    res.render('links/prueba', { links })

})
router.get("/chat", async (req, res) => {
    links = ('')
    res.render('links/chat', { links })

})



router.get("/algo/pruebaaaa", async (req, res) => { //probando

    razon = "Empresa"
    algo = {
        razon
    }

    clientes = await pool.query('Select * from clientes where cuil_cuit like "33-%" ')
    for (var i = 0; i < clientes.length; i++) {
        await pool.query('UPDATE clientes set ? WHERE id = ? ', [algo, clientes[i]['id']])

    }

    /*
let lotes = await pool.query('select * from lotes')
http://localhost:4000/links/algo/pruebaaaa
for (var i=0; i<lotes.length; i++) { 
    nombre= lotes[i]['nombre_razon']
    nombree =  nombre.substr(0, nombre.length - 1);
    nombreee = '%'+nombree+'%'
    console.log(nombreee)
    id = lotes[i]['id']
    cliente  = await pool.query('select * from clientes where Nombre like ?',[nombreee])
 try {
        cuil_cuit = cliente[0]['cuil_cuit']
        
        
        insert = {
            cuil_cuit
        }
        await pool.query('UPDATE lotes set ? WHERE id = ? ', [insert,id])
    } catch (error) {
        console.log(error)
        
    }

}


*/
    res.redirect('/links/clientes/todos')
})


router.get('/clientesconcuotas', isLoggedIn, async (req, res) => {

    const links = await pool.query('SELECT clientes.cuil_cuit, clientes.Nombre  FROM  cuotas left join clientes on cuotas.cuil_cuit = clientes.cuil_cuit group by clientes.cuil_cuit')

    res.render('links/list', { links })

})

router.get('/detalle/:cuil_cuit', isLoggedInn2, async (req, res) => {
    const { cuil_cuit } = req.params
 
    const links = await pool.query('SELECT * FROM clientes WHERE cuil_cuit= ?', [cuil_cuit])

    res.json(links)

})


router.get('/clientehabilitado/:cuil_cuit', isLoggedInn2, async (req, res) => {
    const { cuil_cuit } = req.params
 
    const links = await pool.query('SELECT * FROM clientes WHERE cuil_cuit= ?', [cuil_cuit])
    const habilitado = await pool.query('SELECT * FROM registro_operaciones WHERE cuil_cuit_referencia = ? and (adicional = "Habilitado" or adicional = "deshabilitado")', [cuil_cuit])
   console.log(habilitado.length)
    if (habilitado.length>0){
    reg= habilitado[(habilitado.length)-1]
        }else{
            reg= {cuil_cuit:'Sistema',
            fecha: '20/05/2022'}

        }
    
    res.json([links,reg])

})
// MODIDICACION CLIENTES
router.post('/modificarcli',isLoggedInn2, async (req, res) => {
    const { cuil_cuit, email, provincia, telefono, ingresos, domicilio, razon_social } = req.body
    
    try {
        aux = '%' + cuil_cuit + '%'
        const newLink = {
            email,
            provincia,
            telefono,
            ingresos,
            domicilio,
            razon_social
        }
        await pool.query('UPDATE clientes set ? WHERE cuil_cuit like ?', [newLink, aux])
        res.send('Cliente modificado')
    } catch (error) {
        res.send('Error algo ssucedió' + error)
    }


})
module.exports = router





