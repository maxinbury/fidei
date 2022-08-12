const express = require('express')
const router = express.Router()
const pool = require('../database')


router.get('/lista', async (req, res) => {

    const lista = await pool.query('select * from expedientes')

    res.json(lista)

})

router.get('/expediente/:id', async (req, res) => {
const id = req.params.id
    const exp = await pool.query('select * from expedientes where id= ?',[id])

    res.json(exp)

})
router.post('/modifexpediente', async (req, res) => {
    const {id,Expediente,Iniciador,Extracto,Cpos,Fjs,Barrio,Observacion,Rev,Resp,Ubic,Caratula} = req.body
   try {
    const newLink = {
        Expediente,
        Iniciador,
        Extracto,
        Cpos,
        Fjs,
        Barrio,
        Observacion
        ,Rev
        ,Resp,
        Ubic,
        Caratula
    }
    
    await pool.query('UPDATE expedientes set ? WHERE id = ?', [newLink, id])

        
    
        res.send('todo ok ')
   } catch (error) {
    res.send(error)
   }
   
   
    
    })




module.exports = router