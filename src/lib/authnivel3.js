
module.exports = {
    isLevel3(req,res, next){
        if (req.user.nivel >= 3  ) {    
            return next()   //si es habilitado  continua con el codigo
        }
        return res.redirect('/') //si no es nivel 1 logueado 
    },
    

}