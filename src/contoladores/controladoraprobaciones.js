const pool = require('../database')
const enviodemail = require('../routes/Emails/Enviodemail')


//react
const pendientestodas = async (req, res) => {
    
    try {
        const constancias = await pool.query('SELECT * FROM constancias WHERE  estado = "Pendiente"')
        res.json( constancias )
        
    } catch (error) {
        console.log(error)
        req.flash('message', 'Error algo salio mal')
   
    }
   
}





const aprobar = async (req, res) => {
    const { id } = req.params
    try {


       await pool.query('UPDATE constancias set estado = ? WHERE id = ?', ["Aprobada", id])


        const  aux = await pool.query('select * from constancias  WHERE id = ?', [id])
        const cli =  await pool.query('select * from clientes  WHERE cuil_cuit = ?', aux[0]['cuil_cuit'])
        
        leida = "No"
        const noti = {
            cuil_cuit:aux[0]['cuil_cuit'],
            descripcion:'La constancia'+ aux[0]['tipo'] +'ha sido aprobada ',
            asunto:'Constancia aprobada',
            leida,
            id_referencia:id,
        }
        await pool.query('INSERT INTO notificaciones set ?', [noti]) 

        mensaje= 'Notificamos la constancia ha sido aprobada '

        email = cli[0]['email']
        asunto = 'Constancia Aprobada'
        encabezado= 'Importante'
        
       await enviodemail.enviarmail(email,asunto,encabezado,mensaje)
       
    } catch (error) {
        console.log(error)
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
    const { id, detalle} = req.body;

    console.log(detalle)

    try {
        const constancia = await pool.query('select * from  constancias where id=?',[id])
        const  cuil_cuit = constancia[0]['cuil_cuit']
       await pool.query('UPDATE constancias set estado = ? WHERE id = ?', ["Rechazada", id])
 

        leida = "No"
        const noti = {
            cuil_cuit,
            descripcion:detalle,
            asunto:'Notificaciones',
            leida,
            id_referencia:id,
        }
        await pool.query('INSERT INTO notificaciones set ?', [noti]) 
        cli = await pool.query ('select * from clientes where cuil_cuit = ?',[cuil_cuit])
    
        mensaje= 'Su constancia ha sido rechazada, motivo:'+detalle
        console.log(cli)
        console.log(mensaje)
        email = cli[0]['email']
        asunto = 'Constancia rechazada'
        encabezado= 'este mail es muy importante'
        enviodemail.enviarmail(email,asunto,encabezado,mensaje)
        res.send('rechazado')
    } catch (error) {
        res.send('Algo salio mal')
    }
   

  

}
const rechazarcbu = async (req, res) => {
    const { id, detalle} = req.body;
    console.log(id)
    console.log(detalle)

    try {
        const cbu = await pool.query('select * from  cbus where id=?',[id])
        const  cuil_cuit = cbu[0]['cuil_cuit']
       await pool.query('UPDATE cbus set estado = ? WHERE id = ?', ["R", id])
 

        leida = "No"
        const noti = {
            cuil_cuit,
            descripcion:detalle,
            asunto:'CBU Rechazado',
            leida,
            id_referencia:id,
        }
        await pool.query('INSERT INTO notificaciones set ?', [noti]) 
    
        res.send('rechazado')
    } catch (error) {
       res.send('Algo salio mal')
  }
   

  

}


const rechazarcomp =  async (req, res) => {
    const { id } = req.params

    const pendiente = await pool.query("Select * from constancias where id=?", [id])


    res.render('aprobaciones/rechazar', { pendiente })

}

const rechazo = async (req, res) => {
    const { id, asunto, cuil_cuit, descripcion, nombre } = req.body;
    console.log(asunto)

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
    let cuil_cuit = await pool.query('Select * from cbus where id=?', [id])
     console.log(cuil_cuit)
    cuil_cuit = cuil_cuit[0]['cuil_cuit']
    console.log(cuil_cuit)
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
   
}




const rechazobu =async (req, res) => {
    const { id } = req.params

    const pendiente = await pool.query("Select * from cbus where id=?", [id])


    res.render('aprobaciones/rechazarcbu', { pendiente })

}

const postrechazocbu = async (req, res) => {
    const { id, asunto, cuil_cuit, descripcion, nombre } = req.body;
    console.log(id)

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