const pool = require('../database')








///


const lista = async (req, res) => {
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
   
}


const aprobadas =async (req, res) => {
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
   
}


const solicitaraprobacion = async (req, res) => {
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
   
}


const pendientes = async (req, res) => {
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
   
}


const rechazadas = async (req, res) => {
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
   
}


module.exports = {
    lista,
    aprobadas,
    solicitaraprobacion,
    pendientes,
    rechazadas,
    
}