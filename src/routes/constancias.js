const express = require('express')
const router = express.Router()
const pool = require('../database')
const { isLoggedIn } = require('../lib/auth') //proteger profile
const { isLevel2 } = require('../lib/authnivel2')



// LISTA DE CONSTANCIAS (TODAS)

router.get("/lista/:cuil_cuit", isLoggedIn,isLevel2, async (req, res) => {
    const cuil_cuit = req.params.cuil_cuit
    console.log(cuil_cuit)
    try {
        const constancias = await pool.query('SELECT * FROM constancias WHERE cuil_cuit = ? ', [cuil_cuit])
        res.render('constancias/lista', { constancias })
        
    } catch (error) {
        console.log(error)
        req.flash('message', 'Error algo salio mal')
        res.redirect('/links/clientes')
    }
   
})


// LISTA DE CONSTANCIAS APROBADAS
router.get("/aprobadas/:cuil_cuit", isLoggedIn,isLevel2, async (req, res) => {
    const cuil_cuit = req.params.cuil_cuit
    console.log(cuil_cuit)
    try {
        const constancias = await pool.query('SELECT * FROM constancias WHERE cuil_cuit = ? and estado = "A"', [cuil_cuit])
        res.render('constancias/aprobadas', { constancias })
        
    } catch (error) {
        console.log(error)
        req.flash('message', 'Error algo salio mal')
        res.redirect('/links/clientes')
    }
   
})

// solicitar 
router.get("/solicitaraprobacion/:cuil_cuit", isLoggedIn,isLevel2, async (req, res) => {
    const cuil_cuit = req.params.cuil_cuit
    console.log(cuil_cuit)
    try {
        const constancias = await pool.query('SELECT * FROM constancias WHERE cuil_cuit = ? and estado = "A"', [cuil_cuit])
        res.render('constancias/aprobadas', { constancias })
        
    } catch (error) {
        console.log(error)
        req.flash('message', 'Error algo salio mal')
        res.redirect('/links/clientes')
    }
   
})



// LISTA DE CONSTANCIAS PENDIENTES
router.get("/pendientes/:cuil_cuit", isLoggedIn,isLevel2, async (req, res) => {
    const cuil_cuit = req.params.cuil_cuit
    console.log(cuil_cuit)
    try {
        const constancias = await pool.query('SELECT * FROM constancias WHERE cuil_cuit = ? and estado = "P"', [cuil_cuit])
        res.render('constancias/pendientes', { constancias })
        
    } catch (error) {
        console.log(error)
        req.flash('message', 'Error algo salio mal')
        res.redirect('/links/clientes')
    }
   
})


// LISTA DE CONSTANCIAS RECHAZADAS
router.get("/rechazadas/:cuil_cuit", isLoggedIn,isLevel2, async (req, res) => {
    const cuil_cuit = req.params.cuil_cuit
    console.log(cuil_cuit)
    try {
        const constancias = await pool.query('SELECT * FROM constancias WHERE cuil_cuit = ? and estado = "R"', [cuil_cuit])
        res.render('constancias/rechazadas', { constancias })
        
    } catch (error) {
        console.log(error)
        req.flash('message', 'Error algo salio mal')
        res.redirect('/links/clientes')
    }
   
})

module.exports = router