const express = require('express')
const router = express.Router()
const pool = require('../database')
const { isLoggedIn } = require('../lib/auth') //proteger profile
const { isLevel2 } = require('../lib/authnivel2')




router.get('/', isLoggedIn, isLevel2, async (req, res) => {
    const pendientes = await pool.query("Select * from constancias where estado = 'P'")
    console.log(pendientes)
    res.render('aprobaciones/aprobaciones', { pendientes })

})
router.get('/cbu', isLoggedIn, isLevel2, async (req, res) => {
    const pendientes = await pool.query("Select * from cbus where estado = 'P'")
    console.log(pendientes)
    res.render('aprobaciones/aprobacionescbu', { pendientes })

})
router.get('/aprobarcbu/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params
        
    await pool.query('UPDATE cbus set estado = ? WHERE id = ?', ["A", id])
    req.flash('success', 'Aprobado')
})


router.get('/aprobar/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params
    const idaux = await pool.query('SELECT id_cliente FROM constancias WHERE id = ?',[id])
        console.log(idaux[0]['id_cliente'])
    await pool.query('UPDATE constancias set estado = ? WHERE id = ?', ["A", id])
    req.flash('success', 'Aprobado')
    const cant = await pool.query('Select count(*) from constancias WHERE id_cliente = ? and estado = "P"',[idaux[0]['id_cliente']])
 
    console.log(cant[0]['count(*)'])

    if (cant[0]['count(*)'] == 0 ){
        
        await pool.query("UPDATE users set habilitado = ? WHERE id = ?", ["SI", idaux[0]['id_cliente']])
    }
    res.redirect('/aprobaciones/')
})










module.exports = router