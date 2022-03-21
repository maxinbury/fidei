/*const express = require ('express')

const pool = require('../database')

 module.exports = {
    isClient  (req,res, next)  {
        const nivel = pool.query('SELECT nivel FROM users where nivel = ? ', [req.user.id]) //[req.user.id]
        console.log(links)
        if ( nivel === 1 ) {    
            return next()   //si existe esta seccion continua con el codigo
        }
        return res.redirect('/profile') //si no esta logueado 
    },

    }
 

*/
