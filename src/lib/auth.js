const jwt = require("jsonwebtoken")

module.exports = {
    //Decofidicacion de token Logueado
    isLoggedInn(req,res, next){
        const authorization = req.get('authorization') ///
        let token =null
        console.log(authorization)
        if (authorization && authorization.startsWith('Bearer')){
            
            token = authorization.substring(7) ////  Bearer  length
            console.log(token)
            
        }
        let decodedToken = {}
        
        try{
          
             decodedToken = jwt.verify(token, 'fideicomisocs121')
           
        }catch(error){
            console.log('error')
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
             decodedToken = jwt.verify(token, 'fideicomisocs121')
           
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
             decodedToken = jwt.verify(token, 'fideicomisocs121')
             
           
        }catch{}
      
        if (!token || !decodedToken.id || (decodedToken.nivel <3) ){
            console.log('error token')
            return res.send('error login')
        }
      
       // res.send(decodedToken.cuil_cuit)
        
        next()
    },
    isLoggedInn4(req,res, next){
    
        //
        const authorization = req.get('authorization')
        let token =null
        console.log(authorization)
        if (authorization && authorization.startsWith('Bearer')){
            console.log('entraa')
            token = authorization.substring(7) 
        }
        let decodedToken = {}
        
        try{
             decodedToken = jwt.verify(token, 'fideicomisocs121')
             
           
        }catch(error){
          
        }
      console.log(decodedToken.nivel )
        if (!token || !decodedToken.id || (decodedToken.nivel <4) ){
            console.log('error token')
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