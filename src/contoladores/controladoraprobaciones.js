const pool = require('../database')



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


        let aux = await pool.query('select * from constancias  WHERE id = ?', [id])
        const cuil_cuit = aux[0]['cuil_cuit']
        aux = await pool.query('select * from constancias where cuil_cuit = ?', [cuil_cuit])




        aux = await pool.query('select * from constancias  WHERE tipo = "Dni" and estado ="A" and cuil_cuit = ?', [cuil_cuit])
       /*  if (aux.length > 0) {
            
            aux = await pool.query('select * from constancias  WHERE tipo ="djorigen" and estado="A" and cuil_cuit = ?', [cuil_cuit])
            if (aux.length > 0) {
                aux = await pool.query('select * from constancias  WHERE tipo ="djdatospers" and estado="A" and cuil_cuit = ?', [cuil_cuit])
                if (aux.length > 0) {
                    aux = await pool.query('select * from constancias  WHERE tipo ="djcalidadpers" and estado="A" and cuil_cuit = ?', [cuil_cuit])
                    if (aux.length > 0) {
                        aux = await pool.query('select * from constancias  WHERE tipo ="Domicilio" and estado="A" and cuil_cuit = ?', [cuil_cuit])
                        if (aux.length > 0) {
                            aux = await pool.query('select * from constancias  WHERE tipo ="Balance" and estado="A" and cuil_cuit = ?', [cuil_cuit])
                            if (aux.length > 0) {
                                aux = await pool.query('select * from constancias  WHERE tipo ="DjIVA" and estado="A" and cuil_cuit = ?', [cuil_cuit])
                                if (aux.length > 0) {
                                    aux = await pool.query('select * from constancias  WHERE tipo ="Djprovision" and estado="A" and cuil_cuit = ?', [cuil_cuit])
                                    if (aux.length > 0) {
                                         aux = await pool.query('select * from users  WHERE cuil_cuit = ?', [cuil_cuit])
                                         console.log(aux)
                                        if (aux[0]['razon'] > 'Empresa') { // si es empresa

                                            aux = await pool.query('select * from constancias  WHERE tipo ="Estatuto" and estado="A" and cuil_cuit = ?', [cuil_cuit])
                                            if (aux.length > 0) {
                                                aux = await pool.query('select * from constancias  WHERE tipo ="Actaorgano" and estado="A" and cuil_cuit = ?', [cuil_cuit])
                                                if (aux.length > 0) {
                                                    console.log("entra")
                                                    aux = await pool.query('select * from constancias  WHERE tipo ="ConstAFIP" and estado="A" and cuil_cuit = ?', [cuil_cuit])
                                                    if (aux.length > 0) {
                                                        await pool.query("UPDATE users set habilitado = ? WHERE cuil_cuit = ?", ["SI", cuil_cuit])
                                                    }
                                                }

                                            }


                                        } else { // si es persona

                                            aux = await pool.query('select * from constancias  WHERE tipo ="const_cuil" ="A" and cuil_cuit = ?', [cuil_cuit])
                                            if (aux.length > 0) {
                                               await pool.query("UPDATE users set habilitado = ? WHERE cuil_cuit = ?", ["SI", cuil_cuit])
                                            }

                                        }
                                    }

                                }
                            }
                        }
                    }
                }
            }
        } */
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


const aprobarcomp = async (req, res) => {
    const { id } = req.params
    try {


        await pool.query('UPDATE constancias set estado = ? WHERE id = ?', ["A", id])


        let aux = await pool.query('select * from constancias  WHERE id = ?', [id])
        const cuil_cuit = aux[0]['cuil_cuit']
        aux = await pool.query('select * from constancias where cuil_cuit = ?', [cuil_cuit])




        aux = await pool.query('select * from constancias  WHERE tipo = "Dni" and estado ="A" and cuil_cuit = ?', [cuil_cuit])
        if (aux.length > 0) {
            
            aux = await pool.query('select * from constancias  WHERE tipo ="djorigen" and estado="A" and cuil_cuit = ?', [cuil_cuit])
            if (aux.length > 0) {
                aux = await pool.query('select * from constancias  WHERE tipo ="djdatospers" and estado="A" and cuil_cuit = ?', [cuil_cuit])
                if (aux.length > 0) {
                    aux = await pool.query('select * from constancias  WHERE tipo ="djcalidadpers" and estado="A" and cuil_cuit = ?', [cuil_cuit])
                    if (aux.length > 0) {
                        aux = await pool.query('select * from constancias  WHERE tipo ="Domicilio" and estado="A" and cuil_cuit = ?', [cuil_cuit])
                        if (aux.length > 0) {
                            aux = await pool.query('select * from constancias  WHERE tipo ="Balance" and estado="A" and cuil_cuit = ?', [cuil_cuit])
                            if (aux.length > 0) {
                                aux = await pool.query('select * from constancias  WHERE tipo ="DjIVA" and estado="A" and cuil_cuit = ?', [cuil_cuit])
                                if (aux.length > 0) {
                                    aux = await pool.query('select * from constancias  WHERE tipo ="Djprovision" and estado="A" and cuil_cuit = ?', [cuil_cuit])
                                    if (aux.length > 0) {
                                         aux = await pool.query('select * from users  WHERE cuil_cuit = ?', [cuil_cuit])
                                         console.log(aux)
                                        if (aux[0]['razon'] > 'Empresa') { // si es empresa

                                            aux = await pool.query('select * from constancias  WHERE tipo ="Estatuto" and estado="A" and cuil_cuit = ?', [cuil_cuit])
                                            if (aux.length > 0) {
                                                aux = await pool.query('select * from constancias  WHERE tipo ="Actaorgano" and estado="A" and cuil_cuit = ?', [cuil_cuit])
                                                if (aux.length > 0) {
                                                    console.log("entra")
                                                    aux = await pool.query('select * from constancias  WHERE tipo ="ConstAFIP" and estado="A" and cuil_cuit = ?', [cuil_cuit])
                                                    if (aux.length > 0) {
                                                        await pool.query("UPDATE users set habilitado = ? WHERE cuil_cuit = ?", ["SI", cuil_cuit])
                                                    }
                                                }

                                            }


                                        } else { // si es persona

                                            aux = await pool.query('select * from constancias  WHERE tipo ="const_cuil" ="A" and cuil_cuit = ?', [cuil_cuit])
                                            if (aux.length > 0) {
                                               await pool.query("UPDATE users set habilitado = ? WHERE cuil_cuit = ?", ["SI", cuil_cuit])
                                            }

                                        }
                                    }

                                }
                            }
                        }
                    }
                }
            }
        }
    } catch (error) {
        console.log(error)
    }

    //
    req.flash('success', 'Aprobado')
    res.redirect('/aprobaciones/')
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

    await pool.query('UPDATE cbus set estado = ? WHERE id = ?', ["A", id])
    const descripcion = 'Solicitud CBU aprobada'
    const cuil_cuit = (await pool.query('Select cuil_cuit from cbus where id=?', [id]))[0]['cuil_cuit']
    leida = "No"
    const asunto = "Cbu aprobado"
    const noti = {
        cuil_cuit,
        descripcion,
        asunto,
        leida
    }

    await pool.query('INSERT INTO notificaciones set ?', [noti])
    req.flash('success', 'Aprobado')
    res.redirect('/aprobaciones/cbu')
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
    aprobarcomp,
    rechazarcomp,
    rechazo,
    aprobacioncbu,
    aprobarcbu,
    rechazobu,
    postrechazocbu,
    pendientestodas,
    aprobar,
    rechazar2

}