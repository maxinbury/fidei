const express = require('express')
const router = express.Router()
const pool = require('../database')
const { isLoggedIn } = require('../lib/auth') //proteger profile
const { isLevel2 } = require('../lib/authnivel2')




router.get('/', isLoggedIn, isLevel2, async (req, res) => {
    const pendientes = await pool.query("Select * from constancias where estado = 'P'")
   
    res.render('aprobaciones/aprobaciones', { pendientes })

})
router.get('/cbu', isLoggedIn, isLevel2, async (req, res) => {
    const pendientes = await pool.query("Select * from cbus where estado = 'P'")
    res.render('aprobaciones/aprobacionescbu', { pendientes })

})
router.get('/aprobarcbu/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params
        
    await pool.query('UPDATE cbus set estado = ? WHERE id = ?', ["A", id])
    const descripcion = 'Solicitud CBU aprobada'
    const cuil_cuit = (await pool.query('Select cuil_cuit from cbus where id=?',[id]))[0]['cuil_cuit']
    leida="No"
    const asunto = "Cbu aprobado"
    const noti ={ cuil_cuit,
         descripcion,
         asunto,
        leida}
   
    await pool.query('INSERT INTO notificaciones set ?',[noti])
    req.flash('success', 'Aprobado')
    res.redirect('/aprobaciones/cbu')
})



router.get('/aprobarcomp/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params

    await pool.query('UPDATE constancias set estado = ? WHERE id = ?', ["A", id])
    req.flash('success', 'Aprobado')
  /*   const cant = await pool.query('Select count(*) from constancias WHERE id_cliente = ? and estado = "P"',[idaux[0]['id_cliente']])
 
    console.log(cant[0]['count(*)'])

    if (cant[0]['count(*)'] == 0 ){
        
        await pool.query("UPDATE users set habilitado = ? WHERE id = ?", ["SI", idaux[0]['id_cliente']])
    } */
    res.redirect('/aprobaciones/')
})




//////////////////////////////////////////////////
router.get('/rechazarcomp/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params

    const pendiente = await pool.query("Select * from constancias where id=?",[id])

    
    res.render('aprobaciones/rechazar', {pendiente})
 
})


router.post("/rechazo", isLoggedIn, async (req, res) => {
    const { id, asunto, cuil_cuit, descripcion, nombre  } = req.body;
    console.log(id)
    
    await pool.query('UPDATE constancias set estado = ? WHERE id = ?', ["R", id])
   
   leida = "No"
    const noti ={ cuil_cuit,
        descripcion,
        asunto,
       leida}
       await pool.query('INSERT INTO notificaciones set ?',[noti]) 

    res.redirect('/aprobaciones/')

})


router.get('/rechazarcbu/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params

    const pendiente = await pool.query("Select * from cbus where id=?",[id])

    
    res.render('aprobaciones/rechazarcbu', {pendiente})
 
})

router.post("/rechazocbu", isLoggedIn, async (req, res) => {
    const { id, asunto, cuil_cuit, descripcion, nombre  } = req.body;
    console.log(id)
    
    await pool.query('UPDATE constancias set estado = ? WHERE id = ?', ["R", id])
   
   leida = "No"
    const noti ={ cuil_cuit,
        descripcion,
        asunto,
       leida}
       await pool.query('INSERT INTO notificaciones set ?',[noti]) 

    res.redirect('/aprobaciones/')

})
   /*
    const idaux = await pool.query('SELECT id_cliente FROM constancias WHERE id = ?',[id])
        console.log(idaux[0]['id_cliente'])
    await pool.query('UPDATE constancias set estado = ? WHERE id = ?', ["A", id])
    req.flash('success', 'Aprobado')
    const cant = await pool.query('Select count(*) from constancias WHERE id_cliente = ? and estado = "P"',[idaux[0]['id_cliente']])
 
    console.log(cant[0]['count(*)'])

    if (cant[0]['count(*)'] == 0 ){
        
        await pool.query("UPDATE users set habilitado = ? WHERE id = ?", ["SI", idaux[0]['id_cliente']])
    }
    res.redirect('/aprobaciones/')*/

////////////////////////////////////








module.exports = router
