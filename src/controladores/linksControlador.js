const express = require('express')
const router = express.Router()
const pool = require('../database')
const { isLoggedIn, isLoggedInn, isLoggedInn2 } = require('../lib/auth') //proteger profile
const XLSX = require('xlsx')
const fs = require('fs')
const multer = require('multer')
const path = require('path')
const sacarguion = require('../public/apps/transformarcuit')
const nodemailer = require("nodemailer");
const enviodemail = require('../routes/Emails/Enviodemail')


const determinarEmpresa = async (req, res) => {
    const { razon, cuil_cuit } = req.body

    const newLink = {
        razon
    }
    try {

        await pool.query('UPDATE clientes set ? WHERE cuil_cuit = ?', [newLink, cuil_cuit])

        try {
            await pool.query('UPDATE users set ? WHERE cuil_cuit = ?', [newLink, cuil_cuit])
            console.log('usuario cambiado ')
        } catch {
            console.log(error)
        }

        res.send('Exito')
    } catch (error) {
        console.log(error)
        res.send('Sin exito')
    }


}




const habilitar = async (req, res) => {
    const { cuil_cuit, cuil_cuit_admin } = req.body
    console.log(cuil_cuit)
    newLink = {
        habilitado: 'Si'
    }
    newLink2 = {
        cuil_cuit: cuil_cuit_admin,
        tabla_referencia: 'clientes',
        cuil_cuit_referencia: cuil_cuit,
        fecha: (new Date(Date.now())).toLocaleDateString(),
        adicional: 'Habilitado'
    }
    try {
        await pool.query('UPDATE clientes set ? WHERE cuil_cuit = ?', [newLink, cuil_cuit])
        await pool.query('insert registro_operaciones  set ?', newLink2)


    } catch (error) {
        console.log(error)

    }



    res.send('exito')


}


const estadisticasLegajos = async (req, res) => {
    const { cuil_cuit } = req.body
    console.log(cuil_cuit)
    const legajos = await pool.query('SELECT * FROM constancias where  cuil_cuit =?', [cuil_cuit])
    const legajosAprobados = await pool.query('SELECT * FROM constancias where  cuil_cuit =? and estado="Aprobada"', [cuil_cuit])
    const cui = '%' + cuil_cuit + '%'
    const client = await pool.query('select * from clientes where cuil_cuit like ? ', [cui])
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

        if (razon == 'Empresa') {
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
                    d = ""
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
        } else {
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


    if (razon == 'Empresa') {
        Faltan = 'Aun falta completar ' + a + b + c + d + e + f + g + h + aux + j + k + m
        porccompleto = (aa + bb + cc + dd + ee + ff + gg + hh + auxaux + jj + kk + mm)

        porccompleto = porccompleto / 12

        porccompleto = (porccompleto * 100).toFixed(2)
    } else {
        console.log('Persona')
        Faltan = 'Aun falta completar ' + a + b + e + aux + j + k + l
        porccompleto = (aa + bb + ee + auxaux + jj + kk + ll)

        porccompleto = porccompleto / 7

        porccompleto = (porccompleto * 100).toFixed(2)
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


}

const deshabilitar = async (req, res) => {
    const { cuil_cuit, cuil_cuit_admin } = req.body

    newLink = {
        habilitado: 'No'
    }
    newLink2 = {
        cuil_cuit: cuil_cuit_admin,
        tabla_referencia: 'clientes',
        cuil_cuit_referencia: cuil_cuit,
        fecha: (new Date(Date.now())).toLocaleDateString(),
        adicional: 'Deshabilitado'
    }
    try {
        await pool.query('UPDATE clientes set ? WHERE cuil_cuit = ?', [newLink, cuil_cuit])
        await pool.query('insert registro_operaciones  set ?', newLink2)
    } catch (error) {
        console.log(error)

    }



    res.send('exito')


}

const borrarCbu = async (req, res) => {
    let { id } = req.params

    try {
        await pool.query('DELETE  FROM cbus WHERE id = ?', [id])
        res.json('Borrado')

    } catch (error) {
        console.log(error)
        res.json('Error algo sucedio ')

    }


}


const cantidadInfo = async (req, res) => {

    const clientes = await pool.query('select * from clientes order by nombre')

    res.json(clientes)


}




const lista2 = async (req, res) => {

    const clientes = await pool.query('select * from clientes where cod_zona="Legales" ')
    fecha = (new Date(Date.now())).toLocaleDateString()
    console.log(fecha)
    const fech = fecha.split("/");
    const mesact = parseInt(fech[0])
    const anoac = parseInt(fech[2])

    let env = []
    let tot = []
    let pagadas =[]
    for (cli in clientes) {
      
        pagadas =[]
        tot = []
        let bandmesconcurr = false
        let lotes = await pool.query('select * from lotes  where cuil_cuit=? ', [clientes[cli]['cuil_cuit']])
        let quelote =""
        let cantidad_falt = 0
        let cantidad_venc = 0
     
        for (lot in lotes) {
            quelote =quelote+lotes[lot]['manzana']+" - "+lotes[lot]['parcela']
            let cuotaact = await pool.query('select * from cuotas left join (select id_cuota from pagos )as sele on cuotas.id=sele.id_cuota where id_cuota is null and id_lote=?', [lotes[lot]['id']])
            let cuotavenc = await pool.query('select * from cuotas where mes=? and anio=? and id_lote=? and pago>0 ', [mesact, anoac, lotes[lot]['id']])
          tot = await pool.query('select * from cuotas where id_lote=?', [lotes[lot]['id']])
             pagadas = await pool.query('select * from cuotas  join (select id_cuota from pagos )as sele on cuotas.id=sele.id_cuota where  id_lote=?', [lotes[lot]['id']])
    
        
            if (cuotavenc.length > 0) {
                bandmesconcurr = true
            }
            cantidad_falt += cuotaact.length
            for (actt in cuotaact) {
                if (cuotaact[actt]['anio'] < anoac) {
                   
                    cantidad_venc += 1
                } else {
                    if (cuotaact[actt]['anio'] == anoac) {
                      
                            if (cuotaact[actt]['mes'] < mesact) {
                  
                               cantidad_venc = cantidad_venc+1
                             
                            }
                    }
                }  
            }        
        }
  
       
        let nuevo = {
            cuil_cuit: clientes[cli]['cuil_cuit'],
            Nombre: clientes[cli]['Nombre'],
            cantidad_falt,
            bandmesconcurr,
            cantidad_venc,
            quelote,
            pagadas:pagadas.length,
            totales: tot.length

        }
        env.push(nuevo)
    }

    res.json(env)


}


const cbusPendientes = async (req, res) => {



    const cbus = await pool.query('select * from cbus where estado="P"',)

    res.json(cbus)


}

const legajosCuil = async (req, res) => {
    const cuil_cuit = req.params.cuil_cuit
    //  fs.writeFileSync(path.join(__dirname,'../dbimages/'))


    const legajos = await pool.query('select * from constancias where cuil_cuit =?', [cuil_cuit])

    /*  legajos.map(img => {
          fs.writeFileSync(path.join(__dirname, '../dbimages/' + img.id + '--.png'), img.comprobante)
  
      })
      const imagedir = fs.readdirSync(path.join(__dirname, '../dbimages/'))*/
    res.json(legajos)


}
const ventalotee = async (req, res) => {
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
            console.log('existe')
            if (existe.length > 0) {
                console.log('existe')
                console.log(existe[0]['id'])
                await pool.query('UPDATE lotes set ? WHERE id = ?', [venta, existe[0]['id']])
                mensaje = 'Lote asignado'
                res.json([mensaje, cuil_cuit])
            } else {
                mensaje = 'Lote no existe'
                res.json([mensaje, cuil_cuit])
            }




        } else {
            const existe = await pool.query('select * from lotes where zona=? and fraccion =? and manzana =? and  lote =?', [zona, fraccion, manzana, parcela, lote])
            console.log('existe')

            if (existe.length > 0) {
                console.log('existe')
                console.log(existe[0]['id'])
                await pool.query('UPDATE lotes set ? WHERE id = ?', [venta, existe[0]['id']])
                mensaje = 'Lote asignado'
                res.json([mensaje, cuil_cuit])
            } else {
                mensaje = 'Lote no existe'
                res.json([mensaje, cuil_cuit])
            }


        }

    } catch (error) {
        console.log(error)
        res.send('algo salio mal')
    }
}

const add2 = async (req, res) => {
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





}
const add3 = async (req, res) => {
    const { Nombre, tipo_dni, domicilio, cuil_cuit, razon, telefono, observaciones } = req.body;
    const newLink = {
        Nombre,
        tipo_dni,
        razon,
        telefono,
        domicilio,
        observaciones,
        cuil_cuit,
        habilitado: "Si",
        cod_zona: "Legales"
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
}
const modificarCuil = async (req, res) => {
    const { cuil_cuit, id } = req.body;




    try {
        const row = await pool.query('Select * from clientes where id = ?', [id]);
        if (row.length > 0) {   // SI YA EXISTE EL CLIENTE
            cuil_cuit_ant = row[0]["cuil_cuit"]
            console.log(cuil_cuit_ant)
            nuevo = {
                cuil_cuit: cuil_cuit
            }

            try {
                await pool.query('UPDATE users set ? WHERE cuil_cuit = ?', [nuevo, cuil_cuit_ant])
            } catch (error) {
                console.log(error)
            }
            try {
                await pool.query('UPDATE clientes set ? WHERE cuil_cuit = ?', [nuevo, cuil_cuit_ant])
            } catch (error) {
                console.log(error)
            }
            try {
                await pool.query('UPDATE cuotas set ? WHERE cuil_cuit = ?', [nuevo, cuil_cuit_ant])
            } catch (error) {
                console.log(error)
            }
            try {
                await pool.query('UPDATE pagos set ? WHERE cuil_cuit = ?', [nuevo, cuil_cuit_ant])
            } catch (error) {
                console.log(error)
            }
            try {
                await pool.query('UPDATE constancias set ? WHERE cuil_cuit = ?', [nuevo, cuil_cuit_ant])
            } catch (error) {
                console.log(error)
            }
            try {
                await pool.query('UPDATE lotes set ? WHERE cuil_cuit = ?', [nuevo, cuil_cuit_ant])
            } catch (error) {
                console.log(error)
            }
            try {
                await pool.query('UPDATE notificaciones set ? WHERE cuil_cuit = ?', [nuevo, cuil_cuit_ant])
            } catch (error) {
                console.log(error)
            }
        }
        else {
            // await pool.query('INSERT INTO clientes set ?', [newLink]);
            res.send('Guardado correctamente')

        }

    } catch (error) {
        console.log(error)
        res.send('message', 'Error algo salio mal')


    }





}


const ventaLoteleg = async (req, res) => {
    const { fraccion, parcela, manzana, cuil_cuit } = req.body;


    try {
        const lote = await pool.query('Select * from lotes where zona=?  and  parcela=? and manzana=?', ["Legales", parcela, manzana]);

        if (lote.length > 0) {
            const newLink = {
                cuil_cuit,
                estado: "Ocupado"
            }
            await pool.query('UPDATE lotes set ? WHERE id = ?', [newLink, lote[0]['id']])
            res.json('Lote asignado')
        } else {
            res.json('Lote no existe')
        }

    } catch (error) {
        console.log(error)
        res.send('message', 'Error algo salio mal')


    }





}

const AgregarIngreso = async (req, res) => {
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


}
const detalleCuil = async (req, res) => {
    const { cuil_cuit } = req.params

    const links = await pool.query('SELECT * FROM clientes WHERE cuil_cuit= ?', [cuil_cuit])

    res.json(links)

}
module.exports = {
    ventaLoteleg,
    add3,
    lista2,
    determinarEmpresa,
    habilitar,
    estadisticasLegajos,
    deshabilitar,
    borrarCbu,
    cantidadInfo,
    cbusPendientes,
    legajosCuil,
    ventalotee,
    add2,
    modificarCuil,
    AgregarIngreso,
    detalleCuil

}


