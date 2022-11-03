const express = require('express')
const router = express.Router()
const pool = require('../database')


router.get('/listacursos', async (req, res) => {

    const lista = await pool.query('select * from esmecursos')

    res.json(lista)

})

router.get('/expediente/:id', async (req, res) => {
const id = req.params.id
    const exp = await pool.query('select * from expedientes where id= ?',[id])

    res.json(exp)

})
router.post('/nuevocurso', async (req, res) => {
    const {nombre, profesor,otro }= req.body
   try {
    const newLink = {
        nombre,
        profesor,
        otro
    }
    
    await pool.query('insert esmecursos  set ?', newLink)

        
    
        res.send('todo ok ')
   } catch (error) {
    res.send(error)
   }
   
   
    
    })




module.exports = router