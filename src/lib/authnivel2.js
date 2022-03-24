
module.exports = {
    isLevel2(req,res, next){
        if (req.user.nivel == 2 ) {    
            return next()   //si es habilitado  continua con el codigo
        }
        return res.redirect('/') //si no esta logueado 
    },
    isNotLoggedIn(req,res, next){
        if (!req.isAuthenticated()) {    
            return next()
    }
    return res.redirect('/usuario1')

    }

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