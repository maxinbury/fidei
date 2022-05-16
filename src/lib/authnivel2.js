
module.exports = {
    isLevel2(req,res, next){
        if (req.user.nivel >= 2  ) {    
            return next()   //si es habilitado  continua con el codigo
        }
        return res.redirect('/usuario1') //si no es nivel 1 logueado 
    },
    

}
