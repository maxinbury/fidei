const express = require('express')
const router = express.Router()
const pool = require('../database')
const { isLoggedIn } = require('../lib/auth') //proteger profile
const { isLevel2 } = require('../lib/authnivel2')
const XLSX = require('xlsx')







//  LEER Y CARGAR DEL EXCEL LOS CLIENTES DEL TANGO. NO CONECTAR
router.get('/cargar_todos', isLoggedIn, isLevel2, async (req, res) => {
    console.log("entra")
    const workbook = XLSX.readFile('./src/Excel/Base de Clientes TANGO 04-22.xlsx')
    const workbooksheets = workbook.SheetNames
    const sheet = workbooksheets[0]

    const dataExcel = XLSX.utils.sheet_to_json(workbook.Sheets[sheet])
    //console.log(dataExcel)
  
    
    
    var a=1
    for (const property in dataExcel) {
        a+=1
        aux = dataExcel[property]['Número']
        console.log(aux)
        cuil_cuit = 0
        try {
            cuil_cuit= aux.replace(/\s+/g, '')
        } catch (error) {
            console.log(error)
        }
        
        obs = dataExcel[property]['Observaciones']
         console.log(obs)
        try {

            
            
           
            observaciones= obs.replace(/\s+/g, '')
            a = observaciones.replace('F','')
            b = a.replace('M','')
            a = b.replace('L','')
            cadena = a.split('-');
            fraccion= cadena[1]
            manzana=cadena[2]
            lote=cadena[3]
    
            cargarcuit={
                cuil_cuit
            }
            await pool.query('UPDATE lotes set ? WHERE manzana = ? lote = ? fraccion = ?', [cargarcuit, manzana, lote, fraccion])
            
        } catch (error) {
            console.log(error)
        }
     
        try{
        const newLink = {
            id:dataExcel[property]['Cód. cliente'],
            razon_social: dataExcel[property]['Razón social'],
            nombre : dataExcel[property]['Nombre comercial'],
            tipo_dni:dataExcel[property]['Tipo de documento'],
            domicilio:dataExcel[property]['Domicilio'],
            cuil_cuit,
            localidad: dataExcel[property]['Localidad'],
            cp: dataExcel[property]['Cód. Postal'],
            telefono: dataExcel[property]['Teléfono'],
            movil:dataExcel[property]['Móvil'],
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

          
        let auxiliarid = await pool.query('select * from clientes  where cuil_cuit = ?',[aux])
        try {
            if (auxiliarid.length>0){
                //hacer la carga al manzanero
            }else{
                await pool.query('INSERT INTO clientes set ?', [newLink]);
            }
            

        } catch (error) {
            console.log(error)
        }


      
    }catch(e){
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
    const { Nombre, tipo_dni, domicilio, cuil_cuit, razon, telefono, osbervaciones,movil } = req.body;
    const newLink = {
        Nombre,
        movil,
        tipo_dni,
        razon,
        telefono,
        domicilio,
        osbervaciones,
        cuil_cuit
        //user_id: req.user.id
    };


    const row = await pool.query('Select * from clientes where cuil_cuit = ?', [req.body.cuil_cuit]);
try { if (row.length > 0) {   // SI YA EXISTE EL CLIENTE
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

    if (cuil_cuit==[]){
        res.redirect('/links/clientes/todos')
    }else{
   aux= '%'+cuil_cuit+'%'
   
    
    const rows = await pool.query('SELECT * FROM clientes WHERE cuil_cuit like ?', [aux])
 


    if (rows.length > 0) {
      
        res.redirect(`/links/busquedacuil/${cuil_cuit}`)
        

    } else {
        req.flash('message', 'Error, cuil/cuit no encontrado ')
        res.redirect('clientes')
    }}
})



router.get("/busquedacuil/:cuil_cuit", isLoggedIn, isLevel2, async (req, res) => {  //RECIBE EL CUIT DEL POST
    const cuil_cuit = req.params.cuil_cuit // requiere el parametro id

     aux = '%'+cuil_cuit+'%'
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
    if (app==[]){
        res.redirect('/links/clientes/todos')
    }else{
    

    aux = '%'+app+'%'
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
        
    }}
    
})

//METODO INTERNO DE BUSQUEDA POR APELLIDO, RECIBE, BUSCA LOS QUE COINCIDEN Y REDIRECCIONA A LISTA FILTRADA
router.get("/app/:app", isLoggedIn, isLevel2, async (req, res) => {
    const app = req.params.app // requiere el parametro id 
    aux = '%'+app+'%'
 
    const links = await pool.query('SELECT * FROM clientes WHERE Nombre like ?', [aux]) //[req.user.id]
    res.render('links/list', { links })
})



// ----------------------------FIN BUSQUEDA DE CLIENTES






// MOSTRAR TODOS LOS CLIENTES---  FALTA LA PAGINACION
router.get('/clientes/todos', isLoggedIn, isLevel2,async (req, res) => {
    const links = await pool.query('SELECT * FROM clientes ')

    res.render('links/todos',{links})

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
    const { cuil_cuit } = req.params
    let aux = '%'+cuil_cuit+'%'
    const links = await pool.query('SELECT * FROM clientes WHERE cuil_cuit like  ?', [aux])



    res.render('links/detallecliente', { links })
})



//  PAGINA DE AGREGAR INGRESO DECLARADO
router.get('/agregaringreso/:cuil_cuit', isLoggedIn, isLevel2, async (req, res) => {
    const { cuil_cuit } = req.params
    aux = '%' + cuil_cuit + '%'
    const cliente = await pool.query('select * from clientes where cuil_cuit like ?', aux)
   
   
    res.render('links/agregaringreso', { cliente })
})

router.post('/agregaringreso', isLevel2, async (req, res) => {
    const {id, ingresos,cuil_cuit } = req.body
    console.log(cuil_cuit)
    const newLink = {
      ingresos
    }
   try {
    await pool.query('UPDATE clientes set ? WHERE id = ?', [newLink, id])
    
   } catch (error) {
       console.log(error)
       
   }

    
    
    res.redirect('/links/detallecliente/'+cuil_cuit)
})
////////////////////////////////


router.get("/algo/prueba",  async (req, res) => {
    links =('')
    res.render('links/prueba', { links })
  
})
router.get("/chat",  async (req, res) => {
    links =('')
    res.render('links/chat', { links })
  
})



router.get("/algo/pruebaaaa",  async (req, res) => { //probando
    
let lotes = await pool.query('select * from lotes')

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



res.redirect('/clientes/todos')
})


module.exports = router





