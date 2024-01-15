const jwt = require("jsonwebtoken")
const {hashf} =require (('../keys.js'))
module.exports = {
    //Decofidicacion de token Logueado
    isLoggedInn(req,res, next){
        const authorization = req.get('authorization') ///
        let token =null

        if (authorization && authorization.startsWith('Bearer')){
            
            token = authorization.substring(7) ////  Bearer  length
            
        }
        let decodedToken = {}
        
        try{
   
           
             decodedToken = jwt.verify(token,hashf.key )
            
        }catch(error){
           //
            console.log(error)
        }
      
        if (!token || !decodedToken.id){
            res.send('error login')
            
        }else{ next()}
      
       // res.send(decodedToken.cuil_cuit)
    },

    ///decodificacion Token y verificacion nivel 2
    isLoggedInn2(req,res, next){
      
        //
        
        const authorization = req.get('authorization')
        let token =null
     
        if (authorization && authorization.startsWith('Bearer')){
          
            token = authorization.substring(7) 
        }
        let decodedToken = {}
    
        try{
             decodedToken = jwt.verify(token, hashf.key)
           
        }catch{}
      
        if (!token || !decodedToken.id || (decodedToken.nivel <2) ){
            
            return res.send('error login')
        }
      
       // res.send(decodedToken.cuil_cuit)
        
        next()
    },
    /////Decodificacion nibel 3
    isLoggedInn3(req,res, next){
       
        //
        const authorization = req.get('authorization')
        let token =null
       
        if (authorization && authorization.startsWith('Bearer')){
           
            token = authorization.substring(7) 
        }
        let decodedToken = {}
        
        try{
             decodedToken = jwt.verify(token, hashf.key)
             
           
        }catch{}
      
        if (!token || !decodedToken.id || (decodedToken.nivel <3) ){
            return res.send('error login')
        }
      
       // res.send(decodedToken.cuil_cuit)
        
        next()
    },
    isLoggedInn4(req,res, next){
    
        //
        const authorization = req.get('authorization')
        let token =null
        if (authorization && authorization.startsWith('Bearer')){
            token = authorization.substring(7) 
        }
        let decodedToken = {}
        
        try{
             decodedToken = jwt.verify(token, hashf.key)
             
           
        }catch(error){
          
        }
      
        if (!token || !decodedToken.id || (decodedToken.nivel <4) ){
            return res.send('error login')
        }
      
       // res.send(decodedToken.cuil_cuit)
        
        next()
    },
/// Veridicacion token con handlebars
    isLoggedIn(req,res, next){
        if (req.isAuthenticated()) {     /// isathenticated metodo de pasport
            return next()   //si existe esta seccion continua con el codigo
        }
        return res.redirect('/signin') //si no esta logueado 
    },
    isNotLoggedIn(req,res, next){
        if (!req.isAuthenticated()) {    
            return next()
    }
    return res.redirect('/profile')

    }

}