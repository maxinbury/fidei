const express = require('express')
const router = express.Router()
const pool = require('../database')
const { isLoggedIn } = require('../lib/auth') //proteger profile
const { isLevel2 } = require('../lib/authnivel2')


router.get('/add', isLoggedIn, isLevel2, (req, res) => {
    res.render('links/add')

})

router.get('/clientes', isLoggedIn, isLevel2, (req, res) => {
    res.render('links/clientes')

})
//editar

router.get('/edit/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params
    const links = await pool.query('SELECT * FROM clientes WHERE id= ?', [id])

    res.render('links/edit', { link: links[0] })
})



router.get("/:cuil_cuit", isLoggedIn, isLevel2, async (req, res) => {
    const cuil_cuit = req.params.cuil_cuit // requiere el parametro id 
    const links = await pool.query('SELECT * FROM clientes WHERE cuil_cuit= ?', [cuil_cuit]) //[req.user.id]

    res.render('links/list', { links })
})

router.get("/app/:app", isLoggedIn, isLevel2, async (req, res) => {
    const app = req.params.app // requiere el parametro id 
    const links = await pool.query('SELECT * FROM clientes WHERE Apellido = ?', [app]) //[req.user.id]
    res.render('links/list', { links })
})



router.post('/add', isLoggedIn, isLevel2, async (req, res) => {
    const { Nombre, Apellido, Direccion, cuil_cuit, razon } = req.body;
    const newLink = {
        Nombre,
        Apellido,
        razon,
        Direccion,
        cuil_cuit
        //user_id: req.user.id
    };


    const row = await pool.query('Select * from clientes where cuil_cuit = ?', [req.body.cuil_cuit]);

    if (row.length > 0) {
        req.flash('message', 'Error cuil_cuit ya existe')
        res.redirect('/links/clientes')
    }
    else {
        await pool.query('INSERT INTO clientes set ?', [newLink]);
        req.flash('success', 'Guardado correctamente')
        res.redirect('/links/clientes')
    }
    
})

//borrar de lista
router.get('/delete/:id', isLoggedIn, isLevel2, async (req, res) => {
    const { id } = req.params.id
    await pool.query('DELETE FROM clientes WHERE ID = ?', [id])
    req.flash('success', 'Cliente eliminado')
    res.redirect('/links')
})


router.post('/edit/:id', isLevel2, async (req, res) => {
    const { id } = req.params
    const { Nombre, Apellido, Direccion } = req.body
    const newLink = {
        Nombre,
        Apellido,
        Direccion
    }
    await pool.query('UPDATE clientes set ? WHERE id = ?', [newLink, id])
    
    req.flash('success', 'Cliente modificado correctamente')
    res.redirect('/links')
})



// buscar cliente por apellido no esta conectado
router.post('/listacuil_cuit', isLoggedIn, isLevel2, async (req, res, next) => {
    const { cuil_cuit } = req.body

    const rows = await pool.query('SELECT * FROM clientes WHERE cuil_cuit = ?', [cuil_cuit])

    if (rows.length > 0) {
        res.redirect(`/links/${cuil_cuit}`)


    } else {
        req.flash('message', 'Error, cuil/cuit no encontrado ')
        res.redirect('clientes')
    }
})

router.post('/listapp', isLoggedIn, isLevel2, async (req, res, next) => {
    const { app } = req.body
    console.log(app)
    const rows = await pool.query('SELECT * FROM clientes WHERE Apellido = ?', [app])

    if (rows.length > 0) {
        res.redirect(`/links/app/${app}`)


    } else {
        req.flash('message', 'Error, Apellido no encontrado ')
        res.redirect('clientes')
    }
})

module.exports = router





