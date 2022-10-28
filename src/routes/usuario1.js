const express = require('express')
const router = express.Router()
const pool = require('../database')
const { isLoggedIn,isLoggedInn, isLoggedInn2  } = require('../lib/auth') //proteger profile
const XLSX = require('xlsx')
const ponerguion = require('../public/apps/transformarcuit')
const sacarguion = require('../public/apps/transformarcuit')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
////
const s3Controller = require('./configAWS/s3-controller');
////////





const diskstorage = multer.diskStorage({
    destination: path.join(__dirname, '../../pdfs'),
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-legajo-' + file.originalname)

    }
}) //para que almacene temporalmente la imagen
const fileUpload = multer({
    storage: diskstorage,

}).single('image')

////////////////

router.post('/upload-to-s3', s3Controller.s3Upload);
router.get('/all-files', s3Controller.s3Get);
router.get('/get-object-url/:key', isLoggedInn, s3Controller.getSignedUrl);


//////PDFSS
router.post('/subirlegajo', isLoggedInn2 ,s3Controller.subirlegajo);

/// determinar pdf
router.post('/determinarPep', isLoggedInn2, s3Controller.determinarPep);


router.post('/subirlegajo1', isLoggedInn,s3Controller.subirlegajo1);
//// REACT  
router.post('/cargarcbu',isLoggedInn, s3Controller.cargarcbu)


router.post('/pagarnivel1', isLoggedInn, s3Controller.pagarniv1);

router.post('/pagonivel2', isLoggedInn2, s3Controller.pagonivel2);

router.post('/justificacion', isLoggedInn, s3Controller.justificar);


router.post('/subirlegajoprueba',isLoggedInn, fileUpload, async (req, res, done) => {
    const {formdata, file} = req.body
  //  console.log(formdata)
    //console.log(file)
  console.log(req.file)
    const type = req.file.mimetype
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
    }
    


})

router.get('/leerimagen ', async (req, res, done) => {
    fs.writeFileSync(path.join(__dirname, '../dbimages/'))

    try {
        rows = await pool.query('select * from consancias')
        res.send('Imagen guardada con exito')

    } catch (error) {
        res.send('algo salio mal')
    }

    rows.map(img => {
        fs.writeFileSync(path.join(__dirname, '../dbimages/' + img.id + '--.png'), img.comprobante)

    })
    const imagedir = fs.readdirSync(path.join(__dirname, '../dbimages/'))
    res.json(imagedir)
})

////////constancias de un pago 

router.get('/constanciasdelpago/:id', isLoggedInn2, async (req, res, ) => {
    id = req.params.id
    const pago = await pool.query('select * from pagos where id =?',[id])
    const constancias = await pool.query('select * from constancias where otros =?',[id])
    const todas = pago.concat(constancias);
    
    try {
       
     
        res.json(todas)
    } catch (error) {
        
    }



})


router.get('/cliente/:cuil_cuit', isLoggedInn, async (req, res, ) => {
    cuil_cuit = req.params.cuil_cuit

    try {
       cliente = await pool.query('select * from clientes where cuil_cuit= ? ',[cuil_cuit])
       
       res.json(cliente)
    } catch (error) {
        res.send('algo salio mal')
    }

   
})




router.get('/cbus/:cuil_cuit', isLoggedInn, async (req, res, ) => {
    cuil_cuit = req.params.cuil_cuit

    try {
       cbus = await pool.query('select * from cbus where cuil_cuit= ? ',[cuil_cuit])
       console.log(cbus)
       res.json(cbus)
    } catch (error) {
        res.send('algo salio mal')
    }

   
})

router.get('/borrarunlegajo/:id', async (req, res, ) => {
    id = req.params.id

    try {
      await pool.query('DELETE FROM constancias WHERE id=?;',[id])
     res.send('borrado')
    } catch (error) {
        res.send('algo salio mal')
    }

   
})
router.get('/constancias/:cuil_cuit', isLoggedInn, async (req, res, ) => {
    cuil_cuit = req.params.cuil_cuit

    try {
       constancias = await pool.query('select * from constancias where cuil_cuit= ? ',[cuil_cuit])
  
       res.json(constancias)
    } catch (error) {
        res.send('algo salio mal')
    }

   
})
router.get('/cbuscliente/:cuil_cuit', isLoggedInn, async (req, res, ) => {
    cuil_cuit = req.params.cuil_cuit

    try {
       cbus = await pool.query('select * from cbus where cuil_cuit= ? and estado ="A"',[cuil_cuit])
       console.log(cbus)
       res.json(cbus)
    } catch (error) {
        res.send('algo salio mal')
    }

   
})

////pago react nivel 1
router.post('/realizarr', isLoggedInn, async (req, res, done) => {
    let { monto, cuil_cuit, mes, anio, id } = req.body;

    let estado = 'P'


    let cuil_cuit_distinto = 'Si'
    let monto_distinto = 'Si'
    let monto_inusual = 'No'

    /*  
        hacer comparacion del 30%

    const workbook = XLSX.readFile('./src/Excel/cuentas_PosicionConsolidada.xls')
     const workbooksheets = workbook.SheetNames
     const sheet = workbooksheets[0]
 
     const dataExcel = XLSX.utils.sheet_to_json(workbook.Sheets[sheet])
     //console.log(dataExcel)
 

 
     for (const property in dataExcel) {
         if ((dataExcel[property]['Descripción']).includes(cuil_cuit)) {
             estado = 'A'
             // tipo de pago normal 
         }
     }
      let cuil_cuit_distinto = 'Si'
  */
    aux = '%' + cuil_cuit + '%'
   
    let  existe = await pool.query('Select * from cuotas where  id_lote=? and parcialidad = "Final"  order by nro_cuota', [id])
  
    ultima = ((existe.length)-1)

  
    
    id_cuota = existe[ultima]['id']
    mes = existe[ultima]['mes']
    anio = existe[ultima]['anio']
     console.log('Cuota a pagar ')
     console.log(existe)
    if (existe.length > 0) {
        /// traer la ultima
        
         ///
         console.log(aux)
        let cliente  = await pool.query('Select * from clientes where cuil_cuit like ? ', [aux])
       
        try {
            montomax = cliente[0]['ingresos'] * 0.3
            console.log(4)
            if (montomax < monto) {

                monto_inusual='Si'
            }

        } catch (error) {
            console.log(error)
        }
      
       

        const id_cuota = existe[0]["id"]
        console.log(id_cuota)
        if (estado != 'A') {
            console.log(1)
            const newInu = {
                id_cuota,
                cuil_cuit,
                estado,
                mes,
                anio,
             
    
            };
            console.log(1)
            await pool.query('INSERT INTO historial_pagosi SET ?', [newInu]);
        
        }
        const newLink = {
            id_cuota,
            monto,
            cuil_cuit,
            estado,
            mes,
            anio,
            cuil_cuit_distinto,
            monto_distinto,
            monto_inusual,

        };
      
        await pool.query('INSERT INTO pagos SET ?', [newLink]);
        
        res.send('Subido exitosamente')

    } else {
        res.send('Error la cuota no existe')


    }

})
////////modificar daos
router.post('/modificarcli',isLoggedInn, async (req, res) => {
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
        res.send('Error algo sucedió' + error)
    }


})

//////////////////////checklegajos
router.post("/completolegajos", isLoggedInn, async (req, res) => {
    const { cuil_cuit } = req.body
    console.log(cuil_cuit)

    const legajosAprobados = await pool.query('SELECT * FROM constancias where  cuil_cuit =? and estado="Aprobada"', [cuil_cuit])
   const cui =  '%'+cuil_cuit+'%'
    const client = await pool.query('select * from clientes where cuil_cuit like ? ',[cui])
    razon = client[0]['razon']

    aa = false
    bb = false
    cc = false
    dd =false
    ee = false
    ff =false
    gg = false
    hh = false
    auxaux = false
    jj = false
    kk = false
    ll =false
    mm = false

    for (var i = 0; i < legajosAprobados.length; i++) {
       
    if (razon == 'Empresa'){
        switch (legajosAprobados[i]['tipo']) {
            case "Dni":
               
                aa = true
                break;
            case "Constancia de Afip":
              
                bb = true
                break;
            case "Estatuto Social":
              
                cc = true

                break;
            case "Acta del organo decisorio":
             
                dd = true
                break;
            case "Acreditacion Domicilio":
              
                ee = true
                break;
            case "Ultimos balances":
             
                ff = true
                break;
            case "DjIva":
               
                gg = true

                break;
            case "Pagos Previsionales":
               
                hh = true
                break;
            case "Dj Datospers":
                
                auxaux = true
                break;
            case "Dj CalidadPerso":
              
                jj = true
                break;
            case "Dj OrigenFondos":
              
                kk = true
                break;
                case "Referencias comerciales":
                  
                    mm = true
                    break;
            default:
                break;
        }
    }else{
        switch (legajosAprobados[i]['tipo']) {
            case "Dni":
               
                aa = true
                break;
            case "Constancia de Afip":
               
                bb = true
                break;
          
            case "Acreditacion Domicilio":
             
                ee = true
                break;
            
            case "Dj Datospers":
               
                auxaux = true
                break;
            case "Dj CalidadPerso":
              
                jj = true
                break;
            case "Dj OrigenFondos":
               
                kk =true
                break;
                case "Acreditacion de ingresos":
                   
                    ll = true
                    break;
            default:
                break;
        }


    }

    }
   
 
 if (razon == 'Empresa'){
    respuesta = [aa , bb , ee , auxaux , jj , kk , ff,  gg , hh , cc,dd, mm]


 }else {
  
    respuesta = [aa, bb ,  ee ,  auxaux , jj, kk,ll]


 }
   
    res.json(respuesta)


})
///lotes del cliente
router.get('/lotescliente/:cuil_cuit', isLoggedInn,  async (req, res) => {
    cuil_cuit = req.params.cuil_cuit

    
    lotes = await pool.query('select  * from lotes where cuil_cuit =  ?', [cuil_cuit]);
    cuotas =  await pool.query('select  * from cuotas where cuil_cuit =  ? and parcialidad = "Final"', [cuil_cuit]);
    cliente =await pool.query('select  * from clientes where cuil_cuit =  ?', [cuil_cuit]);
    cuotaapagar= cuotas[(cuotas.length-1)]
    console.log(cuotaapagar)

res.send([lotes,cuotas,cuotaapagar,cliente])

})

///cuotasdeunlote
router.get("/lote2/:id",  isLoggedInn, async (req, res) => {
    try {
        const id = req.params.id
        console.log('controladorloteduncion')
        console.log(id)
       
    
        const cuotas = await pool.query('SELECT * FROM cuotas WHERE id_lote =  ? and parcialidad="final"', [id])
        console.log(cuotas)
        if (cuotas.length > 0) {
    
            /*      let aux = '%' + auxiliar[0]['cuil_cuit'] + '%'
               cliente = await pool.query('SELECT * FROM clientes WHERE cuil_cuit like ? ', [aux]) */
            res.json(cuotas)
            //res.render('cuotas/listavacia', { auxiliar })
    
        } else {/* res.render('cuotas/lista', { cuotas })*/ res.json('') }
        
    } catch (error) {
        
    }
 
})


///////////////////-------------MENU PRINCIPAL--- VERIFICACION DE HABILITACION PARA PAGAR 
router.get('/', isLoggedIn, async (req, res) => {
    let cuil_cuit = req.user.cuil_cuit

    let cliente = await pool.query('select * from users where cuil_cuit = ? ', [cuil_cuit])
    console.log(cliente)

    res.render('usuario1/menu', { cliente })

})

/////////////////////INFORME ESTADO FINANCIERO

router.get('/ief/:id', isLoggedInn, async (req, res) => {
    const id = req.params
    idaux = id.id
    console.log(idaux)
    try {
        
   
    let lote = await pool.query('select * from cuotas where id_lote = ? ', [idaux])
    const cantidad =  (await pool.query('select count(*) from cuotas where id_lote = ? and parcialidad = "final"', [idaux]))[0]['count(*)']
   // console.log(cantidad)    cantidad de liquidadas y vencidas
    const devengado =  ((await pool.query('select sum(cuota_con_ajuste) from cuotas where id_lote = ? and parcialidad = "final"', [idaux]))[0]['sum(cuota_con_ajuste)']).toFixed(2)
   // console.log(devengado)

    const abonado  =  ((await pool.query('select sum(pagos.monto)  from cuotas join pagos on cuotas.id = pagos.id_cuota  where id_lote = ? and pagos.estado = "A" and parcialidad = "final"', [idaux]))[0]['sum(pagos.monto)']).toFixed(2)
   //console.log(abonado)

    exigible = (devengado-abonado).toFixed(2)

    const dato1 = {
        'datoa': 'Cantidad de cuotas liquidadas y vencidas',
        'datob': cantidad
    }
    const dato2 = {
        'datoa':  'Monto devengado hasta la cuota',
        'datob': devengado
    }
    const dato3 = {
        'datoa':  'Monto abonado hasta la cuota',
        'datob': abonado
    }
    const dato4 = {
        'datoa':  'Deuda Exigible',
        'datob': exigible
    }
    const deuda_exigible =[dato1,dato2,dato3,dato4]

    const cantidad2 =  (await pool.query('select count(*) from cuotas where id_lote = ? and parcialidad = "Original"', [idaux]))[0]['count(*)']

    const Amortizacion =  (await pool.query('select * from cuotas where id_lote = ? ', [idaux]))[0]['Amortizacion']
   
    const capital =  (await pool.query('select sum(Amortizacion ) from cuotas where id_lote = ? and parcialidad = "Original"', [idaux]))[0]['sum(Amortizacion )']
    console.log(cantidad2)
    console.log(Amortizacion)
    console.log(capital)

    const dato5 = {
        'datoa': 'Cantidad de cuotas a Vencer',
        'datob': cantidad2
    }
    const dato6 = {
        'datoa':  'Monto cuota pura',
        'datob': Amortizacion
    }
    const dato7 = {
        'datoa':  'Saldo de capital a vencer',
        'datob': capital
    }
    const cuotas_pendientes = [dato5,dato6,dato7]

const respuesta = [deuda_exigible,cuotas_pendientes]


    res.json(respuesta)

} catch (error) {
        
}

})



////notificaciones de un cliente, react
router.get("/noticliente/:cuil_cuit", isLoggedInn, async (req, res) => {
    const { cuil_cuit } = req.params
    try {
        const notificaciones = await pool.query('SELECT * FROM notificaciones WHERE cuil_cuit = ? order by id DESC', [cuil_cuit])

        res.json(notificaciones)
    } catch (error) {
        
    }
   

})
///una notificacion
router.get("/notiid/:id", isLoggedInn, async (req, res) => {
    const { id, cuil_cuit} = req.params
    console.log(cuil_cuit)
    try {
        const notificaciones = await pool.query('SELECT * FROM notificaciones WHERE id = ?', [id])
     
        res.json(notificaciones)
    } catch (error) {
        
    }
   

})

// -------------------------------------NOTIFICACIONES 

// LISTADO DE NOTIFICACIONES
router.get("/notificaciones", async (req, res) => {

    const notificaciones = await pool.query('SELECT * FROM notificaciones WHERE cuil_cuit = ?', [req.user.cuil_cuit])

    res.render('usuario1/notificaciones', { notificaciones })

})


// LEER NOTIFICACIONES 
router.get('/leer/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params


    const noti = await pool.query('SELECT * FROM notificaciones where id = ?', [id])





    if (noti[0] != "Si") {
        await pool.query('UPDATE notificaciones SET leida="Si"  where id = ?', [id])

    }

    res.render('usuario1/leer', { noti })
})

// ------------------------------------- FIN   NOTIFICACIONES 



//----------------------------LISTA DE CUOTAS

//LISTAR CUOTAS 
router.get("/cuotas", async (req, res) => {
    const { cuil_cuit } = req.params
   


    const cuotas = await pool.query('SELECT * FROM cuotas WHERE cuil_cuit = ? and parcialidad != "Final" ', [cuil_cuit])
  


 
    res.json(cuotas )

})


// LISTA DE CUOTAS CON DETALLES 

router.get("/cuotasamp", async (req, res) => {

    cuil_cuit = req.user.cuil_cuit



    cuil_cuit = (cuil_cuit).slice(0, 2) + "-" + (cuil_cuit).slice(2);


    cuil_cuit = (cuil_cuit).slice(0, 11) + "-" + (cuil_cuit).slice(11);
    aux = '%' + cuil_cuit + '%'
    console.log(aux)

    const cuotas = await pool.query('SELECT * FROM cuotas WHERE cuil_cuit like ? and parcialidad != "Original" ', [aux])
    var devengado = 0
    var pagado = 0

    for (var i = 0; i < cuotas.length; i++) {
        if (cuotas[i]['parcialidad'] = 'Final') {
            devengado += cuotas[i]['cuota_con_ajuste']
        }
        ;
    }
    const pagos = await pool.query('SELECT * FROM pagos WHERE cuil_cuit = ? and estado = "A"', [req.user.cuil_cuit])

    for (var i = 0; i < pagos.length; i++) {

        pagado += pagos[i]['monto']

            ;
    }
    const total = {
        pagado,
        devengado

    }
    //  const total = [totall]

    cuotas.push(total)
    res.render('usuario1/listacuotasamp', { cuotas })

})



//----------------------------FIN LISTA DE CUOTAS---------------------------------------------------

// LISTADO DE PAGOS 

router.get("/pagos", async (req, res) => {


    const pagos = await pool.query('SELECT * FROM pagos WHERE cuil_cuit = ? ', [req.user.cuil_cuit])



    res.render('usuario1/pagos', { pagos })

})



// PAGINA DE ESTADO DE CUOTAS Y PAGOS

router.get("/estado", async (req, res) => {

    const cuotas = await pool.query('SELECT * FROM cuotas WHERE cuil_cuit = ? ', [req.user.cuil_cuit])
    var devengado = 0
    var pagado = 0

    for (var i = 0; i < cuotas.length; i++) {
        if (cuotas[i]['parcialidad'] = 'Final') {
            devengado += cuotas[i]['cuota_con_ajuste']
        }
        ;
    }
    const pagos = await pool.query('SELECT * FROM pagos WHERE cuil_cuit = ? ', [req.user.cuil_cuit])

    for (var i = 0; i < pagos.length; i++) {

        pagado += pagos[i]['monto']

            ;
    }
    const total = {
        pagado,
        devengado

    }

    cuotas.push(total)


    res.render('usuario1/estado', { cuotas })

})


//------------------------------------------INFORMAR PAGO -------------------------------------------------

// PAGINA DE INFO DE TRANSFERENCIA 
router.get("/subirelegir", isLoggedIn, async (req, res) => {
    let aux = req.user.cuil_cuit
    try {
        let aux = req.user.cuil_cuit
        aux = ponerguion.ponerguion(aux)

        aux = '%' + aux + '%'

        const lote = await pool.query('SELECT * FROM lotes WHERE cuil_cuit like ?', [aux])
        res.render('usuario1/subirelegir', { lote })
    } catch (error) {
        console.log(error)
        res.redirect('/usuario1')
    }





})

router.post('/subirprueba', async (req, res, done) => {
    const { id } = req.body;
    console.log(id)
})




router.post("/subir", isLoggedIn, async (req, res) => {
    const { id } = req.body;

    try {
        lote = await pool.query('select * from lotes where id = ?', id)



        let aux = req.user.cuil_cuit
        aux = (aux).slice(0, 2) + "-" + (aux).slice(2);
        aux = (aux).slice(0, 11) + "-" + (aux).slice(11);


        if (lote[0]['cuil_cuit'] === aux) {
            aux = '%' + aux + '%'

            // cliente = await pool.query('select * from clientes where cuil_cuit like ?', aux)

            cbus = await pool.query('select * from cbus  where cuil_cuit like ? and estado ="A" ', aux)

            console.log(cbus)
        } else {

            req.flash('message', 'Error, ACCESO DENEGADO ')
            res.redirect('/usuario1')
        }

    } catch (error) {
        console.log(error)
        res.redirect('/usuario1')
    }


    if (req.user.habilitado == 'SI') {
        res.render('usuario1/subir', { cbus })
    } else { res.render('usuario1/subirno', { cuotas }) }



})



// GUARDADO DE TRANSFERENCIA 
router.post('/realizar', async (req, res, done) => {
    const { monto, comprobante, mes, anio } = req.body;
    var estado = 'P'

    let cuil_cuit = req.user.cuil_cuit

    cuil_cuit = (cuil_cuit).slice(0, 2) + "-" + (cuil_cuit).slice(2);


    cuil_cuit = (cuil_cuit).slice(0, 11) + "-" + (cuil_cuit).slice(11);
    aux = '%' + cuil_cuit + '%'
    /*  const workbook = XLSX.readFile('./src/Excel/cuentas_PosicionConsolidada.xls')
     const workbooksheets = workbook.SheetNames
     const sheet = workbooksheets[0]
 
     const dataExcel = XLSX.utils.sheet_to_json(workbook.Sheets[sheet])
     //console.log(dataExcel)
 

 
     for (const property in dataExcel) {
         if ((dataExcel[property]['Descripción']).includes(cuil_cuit)) {
             estado = 'A'
         }
     }
  */
    aux = '%' + cuil_cuit + '%'

    const existe = await pool.query('Select * from cuotas where cuil_cuit like ? and mes = ? and anio =?  and parcialidad = "Final"', [aux, mes, anio])

    if (existe.length > 0) {
        let montomaxx = await pool.query('Select * from clientes where cuil_cuit like ? ', [aux])

        try {
            montomax = montomaxx[0]['ingresos']



        } catch (error) {
            console.log(error)
        }



        const id_cuota = existe[0]["id"]
        const newLink = {
            id_cuota,
            monto,
            cuil_cuit,
            estado,
            comprobante,
            mes,
            anio
        };
        await pool.query('INSERT INTO pagos SET ?', [newLink]);

        if (montomax < monto) {

            req.flash('message', 'Atencion pago inusual, sera notificado como tal')


        } else {
            req.flash('success', 'Guardado correctamente, tu solicitud sera procesada y se notificará al confirmarse')
        }
        res.redirect(`/usuario1`);
    } else {
        req.flash('message', 'Error la cuota no existe')
        res.redirect(`/usuario1`)

    }

})


/////////////   SUBIR INUSUAL

router.get("/subirinusual", isLoggedIn, async (req, res) => {

    try {
        let aux = req.user.cuil_cuit
        aux = (aux).slice(0, 2) + "-" + (aux).slice(2);

        aux = (aux).slice(0, 11) + "-" + (aux).slice(11);
        aux = '%' + aux + '%'

        cliente = await pool.query('select * from clientes where cuil_cuit like ?', aux)


    } catch (error) {
        console.log(error)
    }

    res.render('usuario1/subirinusual')


})

//------------------------------------------FIN  INFORMAR PAGO -------------------------------------------------

//------------------------------------------ASOCIAR CBU  -------------------------------------------------
// ASOCIAR CBU 
router.get("/cbu", (req, res) => {
    res.render('usuario1/cbu')

})



router.post('/addcbu', async (req, res) => {

    const { lazo, dc, numero, descripcion } = req.body;
    let aux = req.user.cuil_cuit
    aux = (aux).slice(0, 2) + "-" + (aux).slice(2);

    aux = (aux).slice(0, 11) + "-" + (aux).slice(11);

    const cuil_cuit = aux
    const estado = "P"
    const newcbu = {
        cuil_cuit,
        lazo,
        numero,
        descripcion,
        dc,
        estado
    }

    try {
        await pool.query('INSERT INTO cbus SET ?', [newcbu])
        req.flash('message', 'Guardado correctamente, tu solicitud sera procesada y se notificará al confirmarse')
    } catch (error) {
        req.flash('message', 'Error algo paso ')
        console.log(error)
    }



    res.redirect(`/usuario1`);
})




//------------------------------------------FIN ASOCIAR CBU  -------------------------------------------------
















// INICIO DE LEGAJOS 

// PAGINA  LEGAJO  DATOS PERSONALES/EMPRESA ------------------------

router.get("/legajo", async (req, res) => {
    const razon = await pool.query('Select razon from users where cuil_cuit = ?', [req.user.cuil_cuit])
    if (razon[0]['razon'] == 'Empresa') {
        res.render('usuario1/datossociedad')
    } else { res.render('usuario1/datospers') }
})

// comprobante dni 

router.post('/edit_comp_dni', async (req, res) => {
    const { comprobante } = req.body;
    if (comprobante.length > 0) {
        const cuil_cuit = req.user.cuil_cuit
        const estado = "P"
        const tipo = "Dni"
        const id_cliente = req.user.id
        const newr = {
            id_cliente,
            cuil_cuit,
            comprobante,
            estado,
            tipo
        }
        await pool.query('INSERT INTO constancias SET ?', [newr])
        req.flash('success', 'Guardado correctamente, tu solicitud sera procesada y se notificará al confirmarse')
        res.redirect(`/usuario1/legajo`);



    } else {
        req.flash('message', 'Error, Tienes que subir un comprobante ')
        res.redirect('/usuario1/legajo')
    }

})

// constancia de la AFIP

router.post('/edit_comp_afip', async (req, res) => {
    const { comprobante } = req.body;

    if (comprobante.length > 0) {
        const cuil_cuit = req.user.cuil_cuit
        const estado = "P"
        const tipo = "ConstAFIP"
        const id_cliente = req.user.id
        const newr = {
            id_cliente,
            cuil_cuit,
            comprobante,
            estado,
            tipo
        }
        await pool.query('INSERT INTO constancias SET ?', [newr])
        req.flash('success', 'Guardado correctamente, tu solicitud sera procesada y se notificará al confirmarse')
        res.redirect(`/usuario1`);

    } else {
        req.flash('message', 'Error, Tienes que subir un comprobante ')
        res.redirect('/usuario1/legajo')
    }


})

//ESTATUTO SOCIAL
router.post('/edit_comp_estatuto', async (req, res) => {
    const { comprobante } = req.body;

    if (comprobante.length > 0) {
        const cuil_cuit = req.user.cuil_cuit
        const estado = "P"
        const tipo = "Estatuto"
        const id_cliente = req.user.id
        const newr = {
            id_cliente,
            cuil_cuit,
            comprobante,
            estado,
            tipo
        }
        await pool.query('INSERT INTO constancias SET ?', [newr])
        req.flash('success', 'Guardado correctamente, tu solicitud sera procesada y se notificará al confirmarse')
        res.redirect(`/usuario1`);

    } else {
        req.flash('message', 'Error, Tienes que subir un comprobante ')
        res.redirect('/usuario1/legajo')
    }


})




//  ACTA DE ORGANO
router.post('/edit_comp_acta', async (req, res) => {
    const { comprobante, mes, anio } = req.body;


    if (comprobante.length > 0) {
        const cuil_cuit = req.user.cuil_cuit
        const estado = "P"
        const tipo = "Actaorgano"
        const id_cliente = req.user.id
        const newr = {
            id_cliente,
            mes,
            anio,
            cuil_cuit,
            comprobante,
            estado,
            tipo
        }
        try {
            await pool.query('INSERT INTO constancias SET ?', [newr])
            req.flash('success', 'Guardado correctamente, tu solicitud sera procesada y se notificará al confirmarse')
            res.redirect(`/usuario1`);
        } catch (error) {
            console.log(error)
            req.flash('message', 'Error, algo sucedio inesperadamente ')
            res.redirect('/usuario1/legajo')
        }



    } else {
        req.flash('message', 'Error, Tienes que subir un comprobante ')
        res.redirect('/usuario1/legajo')
    }



})

//  ACTA DE ORGANOACREDITACION DOMICILIO  

router.post('/edit_comp_domicilio', async (req, res) => {
    const { comprobante, descripcion } = req.body;

    if (comprobante.length > 0 || descripcion.length > 0) {
        const cuil_cuit = req.user.cuil_cuit
        const estado = "P"
        const tipo = "Domicilio"
        const id_cliente = req.user.id
        const newr = {
            id_cliente,
            cuil_cuit,
            comprobante,
            descripcion,
            estado,
            tipo
        }
        await pool.query('INSERT INTO constancias SET ?', [newr])
        req.flash('success', 'Guardado correctamente, tu solicitud sera procesada y se notificará al confirmarse')
        res.redirect(`/usuario1`);


    } else {
        req.flash('message', 'Error, Tienes que subir un comprobante ')
        res.redirect('/usuario1/legajo')
    }



})
















// ------------------FIN PAGINA  LEGAJO  DATOS PERSONALES/EMPRESA ------------------------






// PAGINA  LEGAJO  INGRESOS DECLARADOS  PERSONALES/EMPRESA ------------------------------
router.get("/ingresos", async (req, res) => {
    const razon = await pool.query('Select razon from users where cuil_cuit = ?', [req.user.cuil_cuit])
    if (razon[0]['razon'] == 'Empresa') {
        res.render('usuario1/ingresose')
    } else { res.render('usuario1/ingresosp') }
})
//  GUARDADO DE BALANCE 
router.post('/edit_comp_balance', async (req, res) => {
    const { comprobante, comprobante2 } = req.body;
    console.log(comprobante)

    if ((comprobante.length == 0) || (comprobante2.length == 0)) {
        req.flash('message', 'Error, se deben subir 2 ')
        res.redirect(`/usuario1/ingresos`)
    } else {

        const cuil_cuit = req.user.cuil_cuit
        const estado = "P"
        const tipo = "Balance"
        const id_cliente = req.user.id
        const newr = {
            id_cliente,
            cuil_cuit,
            comprobante,
            comprobante2,
            estado,
            tipo
        }

        await pool.query('INSERT INTO constancias SET ?', [newr])
        req.flash('success', 'Guardado correctamente, tu solicitud sera procesada y se notificará al confirmarse')
        res.redirect(`/usuario1`);
    }
})
//  GUARDADO DE BALANCE DJ IVA
router.post('/edit_comp_djiva', async (req, res) => {
    const { comprobante, comprobante2, comprobante3 } = req.body;
    console.log(comprobante)

    if ((comprobante.length == 0) || (comprobante2.length == 0) || (comprobante3.length == 0)) {
        req.flash('message', 'Error, se deben subir 3 ')
        res.redirect(`/usuario1/ingresos`)
    } else {

        const cuil_cuit = req.user.cuil_cuit
        const estado = "P"
        const tipo = "DjIVA"
        const id_cliente = req.user.id
        const newr = {
            id_cliente,
            cuil_cuit,
            comprobante,
            comprobante2,
            comprobante3,
            estado,
            tipo,
        }
        await pool.query('INSERT INTO constancias SET ?', [newr])
        req.flash('success', 'Guardado correctamente, tu solicitud sera procesada y se notificará al confirmarse')
        res.redirect(`/usuario1/`);
    }
})

//  GUARDADO DE DATOS PROV 
router.post('/edit_comp_djpagosprov', async (req, res) => {
    const { comprobante, comprobante2, comprobante3 } = req.body;

    if ((comprobante.length == 0) || (comprobante2.length == 0) || (comprobante3.length == 0)) {
        req.flash('message', 'Error, se deben subir 3 ')
        res.redirect(`/usuario1`)
    } else {
        const cuil_cuit = req.user.cuil_cuit
        const estado = "P"
        const tipo = "Djprovision"
        const id_cliente = req.user.id
        const newr = {
            id_cliente,
            cuil_cuit,
            comprobante,
            comprobante2,
            comprobante3,
            estado,
            tipo,
        }
        await pool.query('INSERT INTO constancias SET ?', [newr])
        req.flash('success', 'Guardado correctamente, tu solicitud sera procesada y se notificará al confirmarse')
        res.redirect(`/usuario1`);
    }
})


// ---------------------------------------Fin PAGINA  LEGAJO  INGRESOS DECLARADOS  PERSONALES/EMPRESA ------------------------------






// PAGINA  LEGAJO  INGRESOS DECLARADOS INFO CBU   PERSONALES/EMPRESA 
router.get("/infocbu", async (req, res) => {
    const razon = await pool.query('Select razon from users where cuil_cuit = ?', [req.user.cuil_cuit])
    const cbu = await pool.query('select * from cbus where cuil_cuit=?', [req.user.cuil_cuit])
    if (razon[0]['razon'] == 'Empresa') {
        res.render('usuario1/infocbu', { cbu })
    } else { res.render('usuario1/infocbup') }
})





//-----------------FIN    PAGINA  LEGAJO  INGRESOS DECLARADOS INFO CBU   PERSONALES/EMPRESA -----------

// PAGINA  LEGAJO DECLARACIONS JURADAS----------------------------------------------
router.get("/djs", async (req, res) => {
    const razon = await pool.query('Select razon from users where cuil_cuit = ?', [req.user.cuil_cuit])
    if (razon[0]['razon'] == 'Empresa') {
        res.render('usuario1/djse')
    } else { res.render('usuario1/djsp') }
})
// GUARDADO DJ  DATOS PERSONALES
router.post('/edit_comp_djdatospers', async (req, res) => {
    const { comprobante } = req.body;

    if (comprobante.length > 0) {
        const cuil_cuit = req.user.cuil_cuit
        const estado = "P"
        const tipo = "djdatospers"
        const id_cliente = req.user.id
        const newr = {
            id_cliente,
            cuil_cuit,
            comprobante,
            estado,
            tipo
        }
        await pool.query('INSERT INTO constancias SET ?', [newr])
        req.flash('success', 'Guardado correctamente, tu solicitud sera procesada y se notificará al confirmarse')
        res.redirect(`/usuario1`);


    } else {
        req.flash('message', 'Error, Tienes que subir un comprobante ')
        res.redirect('/usuario1/legajo')
    }


})



// GUARDADO DJ  CALIDAD PERSONA
router.post('/edit_comp_djcalidadpers', async (req, res) => {
    const { comprobante } = req.body;


    if (comprobante.length > 0) {


        const cuil_cuit = req.user.cuil_cuit
        const estado = "P"
        const tipo = "djcalidadpers"
        const id_cliente = req.user.id
        const newr = {
            id_cliente,
            cuil_cuit,
            comprobante,
            estado,
            tipo
        }
        await pool.query('INSERT INTO constancias SET ?', [newr])
        req.flash('success', 'Guardado correctamente, tu solicitud sera procesada y se notificará al confirmarse')
        res.redirect(`/usuario1`);


    } else {
        req.flash('message', 'Error, Tienes que subir un comprobante ')
        res.redirect('/usuario1/legajo')
    }



})
// GUARDADO DJ  DATOS PERSONALES ORIGEN DE FONDOS 

router.post('/edit_comp_jdorigen', async (req, res) => {
    const { comprobante } = req.body;


    if (comprobante.length > 0) {

        const cuil_cuit = req.user.cuil_cuit
        const estado = "P"
        const tipo = "djorigen"
        const id_cliente = req.user.id
        const newr = {
            id_cliente,
            cuil_cuit,
            comprobante,
            estado,
            tipo
        }
        await pool.query('INSERT INTO constancias SET ?', [newr])
        req.flash('success', 'Guardado correctamente, tu solicitud sera procesada y se notificará al confirmarse')
        res.redirect(`/usuario1`);


    } else {
        req.flash('message', 'Error, Tienes que subir un comprobante ')
        res.redirect('/usuario1/legajo')
    }


})
//---------------FIN  PAGINA  LEGAJO DECLARACIONS JURADAS----------------------------------------------

//---------------------INGRESOS DECLARADOS CONTACTO-------------------------------------
// PAGINA  LEGAJO  DE CONTACTO
router.get("/contacto", async (req, res) => {
    const razon = await pool.query('Select razon from users where cuil_cuit = ?', [req.user.cuil_cuit])
    if (razon[0]['razon'] == 'Empresa') {
        res.render('usuario1/contacto')
    } else { res.render('usuario1/contactop') }
})
//METODO DE GUARDADO DE TELEFONO 
router.post('/edit_tel', async (req, res) => {
    const { tel } = req.body;
    const newLink = {
        tel
    }
    const id = req.user.id
    console.log(id)
    await pool.query("UPDATE users SET ? WHERE id = ?", [newLink, id])
    req.flash('success', 'Guardado correctamente')
    res.redirect(`/usuario1`)
})
//METODO DE GUARDADO DE MAIL
router.post('/edit_correo', async (req, res) => {
    const { correo } = req.body;


    if (comprobante.length > 0) {

        const newLink = {
            correo
        }
        const id = req.user.id

        await pool.query('UPDATE users set ? WHERE id = ?', [newLink, id])
        req.flash('success', 'Guardado correctamente')
        res.redirect(`/usuario1`);


    } else {
        req.flash('message', 'Error, Tienes que ingresar un mail ')
        res.redirect('/usuario1/legajo')
    }



})
//---------------------FIN INGRESOS DECLARADOS CONTACTO-------------------------------------



// COMPROBANTE RECIBO
router.post('/edit_comp_recibo', async (req, res) => {
    const { comprobante } = req.body;
    console.log(comprobante)

    if (comprobante.length > 0) {

        const cuil_cuit = req.user.cuil_cuit
        const estado = "P"
        const tipo = "Recibo_sueldo"
        const id_cliente = req.user.id
        const newr = {
            id_cliente,
            cuil_cuit,
            comprobante,
            estado,
            tipo
        }
        await pool.query('INSERT INTO constancias SET ?', [newr])
        req.flash('success', 'Guardado correctamente, tu solicitud sera procesada y se notificará al confirmarse')
        res.redirect(`/usuario1`);


    } else {
        req.flash('message', 'Error, Tienes que subir un comprobante ')
        res.redirect('/usuario1/legajo')
    }


})





// 
router.post('/edit_const_cuil', async (req, res) => {
    const { comprobante } = req.body;


    if (comprobante.length > 0) {

        const cuil_cuit = req.user.cuil_cuit
        const estado = "P"
        const tipo = "const_cuil"
        const id_cliente = req.user.id
        const newr = {
            id_cliente,
            cuil_cuit,
            comprobante,
            estado,
            tipo
        }
        await pool.query('INSERT INTO constancias SET ?', [newr])
        req.flash('success', 'Guardado correctamente, tu solicitud sera procesada y se notificará al confirmarse')
        res.redirect(`/usuario1`);


    } else {
        req.flash('message', 'Error, Tienes que subir un comprobante ')
        res.redirect('/usuario1/legajo')
    }



})




// CHAT







router.post('/chatenviar', async (req, res) => {
    const { mensaje_cliente } = req.body;


    let cuil_cuit = req.user.cuil_cuit
    cuil_cuit = (cuil_cuit).slice(0, 2) + "-" + (cuil_cuit).slice(2);
    console.log(cuil_cuit)

    cuil_cuit = (cuil_cuit).slice(0, 11) + "-" + (cuil_cuit).slice(11);
    const newr = {
        mensaje_cliente,
        cuil_cuit

    }
    await pool.query('INSERT INTO chats SET ?', [newr])

    res.redirect(`/usuario1/chat`);



})

router.get("/chat", async (req, res) => {
    let cuil_cuit = req.user.cuil_cuit
    cuil_cuit = (cuil_cuit).slice(0, 2) + "-" + (cuil_cuit).slice(2);


    cuil_cuit = (cuil_cuit).slice(0, 11) + "-" + (cuil_cuit).slice(11);
    console.log(cuil_cuit)
    const aux = '%' + cuil_cuit + '%'
    const chat = await pool.query('select * from chats where cuil_cuit like ?', [aux])
    console.log(chat)
    res.render('usuario1/chat', { chat })

})





router.get("/menu2", async (req, res) => {



    res.render('usuario1/menu2/index')

})









module.exports = router

