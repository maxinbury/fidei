const pool = require('../database')


const enviarconsulta = async (req, res) => {
    const { nombre,apellido,asunto,consulta,id } = req.body;
try { 
    clie = await pool.query ("select * from users where id = ?",[id] )
    fecha= (new Date(Date.now())).toLocaleDateString(),
     datos = {
       mensaje_cliente:consulta,
       asunto,
       cuil_cuit:clie[0]['cuil_cuit'],
       fecha:fecha

     }
   
     await pool.query('insert into chats set ?', datos)
     res.json('Consulta enviada')


}
catch (error){
    console.log(error)
    res.json('Error algo sucedio')
}
   
    //await  enviodemail.enviarmail.enviarmail("pipao.pipo@gmail.com",asunto,"encabezado",consulta)

}
const subirlegajoprueba =async (req, res, done) => {
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
    


}
const leerimagen = async (req, res, done) => {
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
}
const constanciadelpago =  async (req, res, ) => {
    id = req.params.id
    console.log(id)
    const pago = await pool.query('select * from pagos where id =?',[id])
    const constancias = await pool.query('select * from constancias where otros =?',[id])
    const todas = pago.concat(constancias);
    console.log(todas)
    try {
       
     
        res.json(todas)
    } catch (error) {
        console.log(error)
    }



}
const cliente = async (req, res, ) => {
    cuil_cuit = req.params.cuil_cuit

    try {
       clientes = await pool.query('select * from clientes where cuil_cuit= ? ',[cuil_cuit])
       
       res.json(clientes)
    } catch (error) {
        console.log(error)
        res.send('algo salio mal')
    }

   
}

const cliente2 = async (req, res, ) => {
    cuil_cuit = req.params.cuil_cuit

    try {
       clientes = await pool.query('select * from users where cuil_cuit= ? ',[cuil_cuit])
       console.log(clientes)
       res.json(clientes)
    } catch (error) {
        console.log(error)
        res.send('algo salio mal')
    }

   
}

const usuario1acredingresos =  async (req, res, ) => {
    cuil_cuit = req.params.cuil_cuit

    try {
       constancias  = await pool.query('select * from constancias  where (tipo ="Pago autonomo" or tipo ="Recibo de sueldo" or tipo ="Constancia de Afip" or tipo ="Pago Monotributo" or tipo ="DDJJ IIBB" ) and cuil_cuit= ? ',[cuil_cuit])
       
       res.json(constancias)
    } catch (error) {
        res.send('algo salio mal')
    }

   
}
const cantidadbalances =  async (req, res, ) => {
    cuil_cuit = req.params.cuil_cuit

    try {
     
       cantidad = await pool.query('select * from constancias  where tipo ="Ultimos balances" and cuil_cuit= ? and estado="Aprobada" ',[cuil_cuit])

       res.json(cantidad.length)
    } catch (error) {
        console.log(error)
        res.json('algo salio mal')
    }

   
}
const cantidaddjiva =  async (req, res, ) => {
    cuil_cuit = req.params.cuil_cuit

    try {
     
       cantidad = await pool.query('select * from constancias  where tipo ="DjIva" and cuil_cuit= ?  and estado="Aprobada"',[cuil_cuit])

       res.json(cantidad)
    } catch (error) {
        console.log(error)
        res.json('algo salio mal')
    }

   
}
const cantidadiibb = async (req, res, ) => {
    cuil_cuit = req.params.cuil_cuit

    try {
     
       cantidad = await pool.query('select * from constancias  where tipo ="DDJJ IIBB" and cuil_cuit= ? and estado="Aprobada" ',[cuil_cuit])

       res.json(cantidad.length)
    } catch (error) {
        console.log(error)
        res.json('algo salio mal')
    }

   
}
const cbus =  async (req, res, ) => {
    cuil_cuit = req.params.cuil_cuit

    try {
       cbus = await pool.query('select * from cbus where cuil_cuit= ? ',[cuil_cuit])
     
       res.json(cbus)
    } catch (error) {
        res.send('algo salio mal')
    }

   
}
const borrarunlegajo =  async (req, res, ) => {
    id = req.params.id

    try {
      await pool.query('DELETE FROM constancias WHERE id=?;',[id])
     res.send('borrado')
    } catch (error) {
        res.send('algo salio mal')
    }

   
}
const constanciass = async (req, res, ) => {
    cuil_cuit = req.params.cuil_cuit

    try {
       constancias = await pool.query('select * from constancias where cuil_cuit= ? and tipo <> "Ingresos Declarados" and tipo <> "Documentacion PEP"',[cuil_cuit])
  
       res.json(constancias)
    } catch (error) {
        console.log(error)
        res.json('algo salio mal')
    }

   
}
const cbuscliente = async (req, res, ) => {
    cuil_cuit = req.params.cuil_cuit
console.log(cuil_cuit)
    try {
       cbuss = await pool.query('select * from cbus where cuil_cuit= ? and estado ="A"',[cuil_cuit])
       console.log(cbuss)
       res.json(cbuss)
    } catch (error) {
        console.log(error)
        res.send('algo salio mal')
    }

   
}
const realizarr = async (req, res, done) => {
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

}
const modificarcli =  async (req, res) => {
    const { cuil_cuit,sueldo, email, provincia, telefono, ingresos, domicilio, razon_social } = req.body
    console.log(cuil_cuit,sueldo, email, provincia, telefono, ingresos, domicilio, razon_social)
    try {
        aux = '%' + cuil_cuit + '%'
        const newLink = {
            cuil_cuit,
            sueldo,
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
        console.log(error)
        res.send('Error algo sucedió' + error)
    }


}

const modificarcli2 =  async (req, res) => {
    const { cuil_cuit,sueldo, email, provincia, telefono, nombre, domicilio, razon_social } = req.body
    console.log(cuil_cuit,sueldo, email, provincia, telefono, nombre, domicilio, razon_social)
    try {
        aux = '%' + cuil_cuit + '%'
        const newLink = {
            cuil_cuit,
            sueldo,
             nombre
        }
        await pool.query('UPDATE users set ? WHERE cuil_cuit like ?', [newLink, aux])
        res.send('Cliente modificado')
    } catch (error) {
        console.log(error)
        res.send('Error algo sucedió' + error)
    }


}


const completolegajos = async (req, res) => {
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


}
const lotescliente =  async (req, res) => {
    cuil_cuit = req.params.cuil_cuit

    try {
        lotes = await pool.query('select  * from lotes where cuil_cuit =  ?', [cuil_cuit]);
        cuotas =  await pool.query('select  * from cuotas where cuil_cuit =  ? and parcialidad = "Final"', [cuil_cuit]);
        clienteaux = await pool.query('select  * from clientes where cuil_cuit =  ?', [cuil_cuit]);
        cuotaapagar= cuotas[(cuotas.length-1)]
        console.log(cuotaapagar)
    
    res.send([lotes,cuotas,cuotaapagar,clienteaux])
    } catch (error) {
console.log8error

        res.send([[],[],[],[]])
    }


}

const lotescliente2 =  async (req, res) => {
    id = req.params.cuil_cuit

    try {
        lotes = await pool.query('select  * from lotes where id =  ?', [id]);
        cuotas =  await pool.query('select  * from cuotas where id_lote =  ? and parcialidad = "Final"', [id]);
        clienteaux = await pool.query('select  * from clientes where cuil_cuit =  ?', [lotes[0]['cuil_cuit']]);
        cuotaapagar= cuotas[(cuotas.length-1)]
        console.log(cuotaapagar)
    
    res.send([lotes,cuotas,cuotaapagar,clienteaux])
    } catch (error) {
console.log(error)

        res.send([[],[],[],[]])
    }

}

const lote2 = async (req, res) => {
    try {
        const id = req.params.id
        
        console.log(id)
       
    
        const cuotas = await pool.query('SELECT * FROM cuotas WHERE id_lote =  ? and parcialidad="final"', [id])
       
        if (cuotas.length > 0) {
            const cuil_cuit = cuotas[0]['cuil_cuit']
       
            
               console.log(cuil_cuit)
               let pagos = await pool.query('SELECT * FROM pagos WHERE cuil_cuit =  ?', [cuil_cuit])
              
             
            res.json([cuotas,pagos])
            //res.render('cuotas/listavacia', { auxiliar })
        } else {/* res.render('cuotas/lista', { cuotas })*/ res.json([[],[]]) }
        
    } catch (error) {
        
    }
 
}
const ief =   async (req, res) => {
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
        'datob': cantidad2.toFixed(2)
    }
    const dato6 = {
        'datoa':  'Monto cuota pura',
        'datob': Amortizacion.toFixed(2)
    }
    const dato7 = {
        'datoa':  'Saldo de capital a vencer',
        'datob': capital.toFixed(2)
    }
    const cuotas_pendientes = [dato5,dato6,dato7]

const respuesta = [deuda_exigible,cuotas_pendientes]


    res.json(respuesta)

} catch (error) {
        
}

}
const noticliente =  async (req, res) => {
    const { cuil_cuit } = req.params
    try {
        const notificaciones = await pool.query('SELECT * FROM notificaciones WHERE cuil_cuit = ? order by id DESC', [cuil_cuit])

        res.json(notificaciones)
    } catch (error) {
        
    }
   

}
const notiid = async (req, res) => {
    const { id, cuil_cuit} = req.params
    console.log(cuil_cuit)
    try {
        const notificaciones = await pool.query('SELECT * FROM notificaciones WHERE id = ?', [id])
     
        res.json(notificaciones)
    } catch (error) {
        
    }
   

}
module.exports = {
    notiid,
    noticliente,
    ief,
    lote2,
    lotescliente,
    completolegajos,
    modificarcli,
    realizarr,
    cbuscliente,
    constanciass,
    borrarunlegajo,
    cbus,
    cantidadiibb,
    cantidaddjiva,
    cantidadbalances,
    usuario1acredingresos,
    cliente,
    constanciadelpago,
    leerimagen,
    subirlegajoprueba,
    enviarconsulta,
    cliente2,
    modificarcli2,
    lotescliente2
}