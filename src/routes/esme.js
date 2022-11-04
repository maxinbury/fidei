const express = require('express')
const router = express.Router()
const pool = require('../database')


router.get('/listacursos', async (req, res) => {

    const lista = await pool.query('select * from esmecursos')

    res.json(lista)

})

router.get('/clases/:id', async (req, res) => {
    const id = req.params.id
    const lista = await pool.query('select * from esmeclases where id_curso = ?',[id])
    const curso = await pool.query('select * from esmecursos where id = ?',[id])
    res.json([lista,curso])

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


    router.post('/nuevaclase', async (req, res) => {
        const {tema, fecha,otro }= req.body
       try {
        const newLink = {
            nombre,
            fecha,
            otro
        }
        console.log(newLink)
       await pool.query('insert esmeclases  set ?', newLink)
    
            
        
            res.send('todo ok ')
       } catch (error) {
        res.send(error)
       }
       
       
        
        })
    



module.exports = router