const pool = require('../database')


    const verificar = async(req,res, next)=> {  
    const cuil_cuit = req.body.cuil_cuit
     const aux = await pool.query('SELECT * FROM users WHERE cuil_cuit=? ',[cuil_cuit])
    
    if (aux >0  ) {    
        return true  
    }
    return false}

