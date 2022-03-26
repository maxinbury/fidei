
module.exports = {
    isLevel2(req,res, next){
        if (req.user.nivel == 2  ) {    
            return next()   //si es habilitado  continua con el codigo
        }
        return res.redirect('/usuario1') //si no es nivel 1 logueado 
    },
    

}
/*
const pool = require('../database')


function authnivel2 (rol) {
    return (req, res, next)=>{
        if (req.user.rol == 0) {
            res.status(401)
            return res.send("usuario no autorizado")

        }
        next()
    }
}


module.exports = {authnivel2}
*/