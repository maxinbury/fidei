const express = require('express')
const router = express.Router()
const pool = require('../database')


router.get('/listacursos', async (req, res) => {

    const lista = await pool.query('select * from esmecursos')

    res.json(lista)

})

router.get('/alumnos', async (req, res) => {

    const lista = await pool.query('select * from esmealumnos')

    res.json(lista)

})


router.get('/clases/:id', async (req, res) => {
    const id = req.params.id
    const lista = await pool.query('select * from esmeclases where id_curso = ?',[id])
    const curso = await pool.query('select * from esmecursos where id = ?',[id])
    res.json([lista,curso])

})
router.get('/alumno/:id', async (req, res) => {
    const id = req.params.id
    const al = await pool.query('select * from esmealumnos where id = ?',[id])
  
    res.json(al)

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
    console.log(newLink)
    await pool.query('insert esmecursos  set ?', newLink)

        
    
        res.send('todo ok ')
   } catch (error) {
    console.log(error)
   }
   
   
    
    })


    router.post('/nuevaclase', async (req, res) => {
        let {id,tema, fecha,otro }= req.body
       try {
        arr = fecha.split('-')
        fecha= arr[2]+'/'+arr[1]+'/'+arr[0]
       
        console.log(fecha)
        
        const newLink = {
            tema,
            fecha,
            otro,
            id_curso:id
        }
        console.log(newLink)
      await pool.query('insert esmeclases  set ?', newLink)
    
            
        
            res.send('todo ok ')
       } catch (error) {
        console.log(error)
       }
       
       
        
        })
    

        router.post('/nuevoalumno', async (req, res) => {
            let {nombre, apellido,dni,mail, tel }= req.body
           try {
       
            
            const newLink = {
                nombre,
                apellido,
                dni,
                mail,
                tel
            }
            console.log(newLink)
          await pool.query('insert esmealumnos set ?', newLink)
        
                
            
                res.send('todo ok ')
           } catch (error) {
            console.log(error)
           }
           
           
            
            })

module.exports = router