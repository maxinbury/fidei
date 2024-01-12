const pool = require('../database')








///


const lista = async (req, res) => {
    const cuil_cuit = req.params.cuil_cuit
    try {
        const constancias = await pool.query('SELECT * FROM constancias WHERE cuil_cuit = ? ', [cuil_cuit])
        res.render('constancias/lista', { constancias })
        
    } catch (error) {
       // console.log(error)
        req.flash('message', 'Error algo salio mal')
        res.redirect('/links/clientes')
    }
   
}



const solicitaraprobacion = async (req, res) => {
    const cuil_cuit = req.params.cuil_cuit
    try {
        const constancias = await pool.query('SELECT * FROM constancias WHERE cuil_cuit = ? and estado = "A"', [cuil_cuit])
        res.render('constancias/aprobadas', { constancias })
        
    } catch (error) {
      //  console.log(error)
        req.flash('message', 'Error algo salio mal')
        res.redirect('/links/clientes')
    }
   
}





module.exports = {
    lista,
    solicitaraprobacion,
    
}