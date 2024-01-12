const pool = require('../database')
const enviodemail = require('../routes/Emails/Enviodemail')


//react
const pendientestodas = async (req, res) => {

    try {
        const constancias = await pool.query('SELECT * FROM constancias WHERE  estado = "Pendiente"')
        res.json(constancias)

    } catch (error) {
        //console.log(error)
        req.json('message', 'Error algo salio mal')

    }

}





const aprobar = async (req, res) => {
    const { id } = req.params
    try {


        await pool.query('UPDATE constancias set estado = ? WHERE id = ?', ["Aprobada", id])


        const aux = await pool.query('select * from constancias  WHERE id = ?', [id])
        const cli = await pool.query('select * from clientes  WHERE cuil_cuit = ?', aux[0]['cuil_cuit'])

        leida = "No"
        const noti = {
            cuil_cuit: aux[0]['cuil_cuit'],
            descripcion: 'La constancia' + aux[0]['tipo'] + 'ha sido aprobada ',
            asunto: 'Constancia aprobada',
            leida,
            id_referencia: id,
        }
        await pool.query('INSERT INTO notificaciones set ?', [noti])

        mensaje = 'Estimado/a Cliente <br/>' +
            'Le informamos que la constancias referente a <b> ' + aux[0]['tipo'] + '</b> ha sido <b>aprobada</b>.<br/>' +

            'Sin otro particular, se lo/a saluda atentamente.'
        email = cli[0]['email']
        asunto = 'Constancia Aprobada'
        encabezado = 'Importante'

        await enviodemail.enviarmail.enviarmail(email, asunto, encabezado, mensaje)

    } catch (error) {
       // console.log(error)
    }

    //
    res.send('aprobado')
}








//////








const pendientes = async (req, res) => {
    const pendientes = await pool.query("Select * from constancias where estado = 'P'")


    res.render('aprobaciones/aprobaciones', { pendientes })

}




const rechazar2 = async (req, res) => {
    const { id, detalle } = req.body;

    

    try {
        const constancia = await pool.query('select * from  constancias where id=?', [id])
        const cuil_cuit = constancia[0]['cuil_cuit']
        await pool.query('UPDATE constancias set estado = ? WHERE id = ?', ["Rechazada", id])


        leida = "No"
        const noti = {
            cuil_cuit,
            descripcion: detalle,
            asunto: 'Notificaciones',
            leida,
            id_referencia: id,
        }
        await pool.query('INSERT INTO notificaciones set ?', [noti])
        cli = await pool.query('select * from clientes where cuil_cuit = ?', [cuil_cuit])

      
        mensaje = 'Estimado/a Cliente <br/>' +
            'Le informamos que la constancias referente a <b> ' + constancia[0]['tipo'] + '</b> ha sido <b>rechazada</b> por el siguiente motivo:<br/>' +
            detalle+'.<br/>'
            'Sin otro particular, se lo/a saluda atentamente.'
        email = cli[0]['email']
        asunto = 'Constancia Rechazada'
        encabezado = 'Importante'

        await enviodemail.enviarmail.enviarmail(email, asunto, encabezado, mensaje)
        res.send('rechazado')
    } catch (error) {
       // console.log(error)
        res.send('Algo salio mal')
    }




}
const rechazarcbu = async (req, res) => {
    const { id, detalle } = req.body;
    

    try {
        const cbu = await pool.query('select * from  cbus where id=?', [id])
        const cuil_cuit = cbu[0]['cuil_cuit']
        await pool.query('UPDATE cbus set estado = ? WHERE id = ?', ["R", id])
       
        const cliente = await pool.query('select * from  clientes where cuil_cuit=?', [cuil_cuit])
     
        numerocodif = '******************' + (cbu[0]['numero'])[18] + (cbu[0]['numero'])[19] + (cbu[0]['numero'])[20] + (cbu[0]['numero'])[21]
        mensaje = 'Estimado/a Cliente <br/>' +
            'Le informamos que el certificado de su Cbu numero<b> ' + numerocodif + '</b> ha sido <b>Rechazado</b> debido al siguiente motivo:<br/>' + 
            detalle + '<br/>' +

            'Sin otro particular, se lo/a saluda atentamente.'
       
        email = cliente[0]['email']
        asuntoo = 'Aprobacion de CBU'
        encabezado = 'Notificacion nueva'
        await enviodemail.enviarmail.enviarmail(email, asuntoo, encabezado, mensaje)
        leida = "No"
        const noti = {
            cuil_cuit,
            descripcion: detalle,
            asunto: 'CBU Rechazado',
            leida,
            id_referencia: id,
        }
        await pool.query('INSERT INTO notificaciones set ?', [noti])

        res.send('rechazado')
    } catch (error) {
      //  console.log(error)
        res.send('Algo salio mal')
    }




}


const rechazarcomp = async (req, res) => {
    const { id } = req.params

    const pendiente = await pool.query("Select * from constancias where id=?", [id])


    res.render('aprobaciones/rechazar', { pendiente })

}

const rechazo = async (req, res) => {
    const { id, asunto, cuil_cuit, descripcion, nombre } = req.body;


    await pool.query('UPDATE constancias set estado = ? WHERE id = ?', ["R", id])

    leida = "No"
    const noti = {
        cuil_cuit,
        descripcion,
        asunto,
        leida
    }
    await pool.query('INSERT INTO notificaciones set ?', [noti])

    res.redirect('/aprobaciones/')

}


const aprobacioncbu = async (req, res) => {
    const pendientes = await pool.query("Select * from cbus where estado = 'P'")
    res.render('aprobaciones/aprobacionescbu', { pendientes })

}

const aprobarcbu = async (req, res) => {
    const { id } = req.params
    try {



        let cli = await pool.query('Select * from cbus where id=?', [id])
        cliente = await pool.query('Select * from clientes where cuil_cuit=?', [cli[0]['cuil_cuit']])
        numero = cli[0]['numero']
        numerocodif = '******************' + (cli[0]['numero'])[18] + (cli[0]['numero'])[19] + (cli[0]['numero'])[20] + (cli[0]['numero'])[21]

        mensaje = 'Estimado/a Cliente <br/>' +
            'Le informamos que el certificado de CBU numero<b> ' + numerocodif + '</b> ha sido <b>aprobado</b>.<br/>' +

            'Sin otro particular, se lo/a saluda atentamente.'
    
        email = cliente[0]['email']
        asuntoo = 'Aprobacion de CBU'
        encabezado = 'Notificacion nueva'
        await enviodemail.enviarmail.enviarmail(email, asuntoo, encabezado, mensaje)
        cuil_cuit = cli[0]['cuil_cuit']

        await pool.query('UPDATE cbus set estado = ? WHERE id = ?', ["A", id])
        const descripcion = 'Solicitud CBU aprobada'

        leida = "No"
        const asunto = "Cbu aprobado"
        const noti = {
            cuil_cuit,
            descripcion,
            asunto,
            leida
        }

        await pool.query('INSERT INTO notificaciones set ?', [noti])
        res.send('Aprobado')
    } catch (error) {
      //  console.log(error)
        res.send('Error algo sucedio')
    }
}




const rechazobu = async (req, res) => {
    const { id } = req.params

    const pendiente = await pool.query("Select * from cbus where id=?", [id])


    res.render('aprobaciones/rechazarcbu', { pendiente })

}

const postrechazocbu = async (req, res) => {
    const { id, asunto, cuil_cuit, descripcion, nombre } = req.body;
   

    await pool.query('UPDATE constancias set estado = ? WHERE id = ?', ["R", id])

    leida = "No"
    const noti = {
        cuil_cuit,
        descripcion,
        asunto,
        leida
    }
    await pool.query('INSERT INTO notificaciones set ?', [noti])

    res.redirect('/aprobaciones/')

}
module.exports = {
    pendientes,

    rechazarcomp,
    rechazo,
    aprobacioncbu,
    aprobarcbu,
    rechazobu,
    postrechazocbu,
    pendientestodas,
    aprobar,
    rechazar2,
    rechazarcbu,
    aprobarcbu

}