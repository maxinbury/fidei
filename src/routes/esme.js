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

router.get('/alumnosdelcurso/:id', async (req, res) => {
    const id = req.params.id
        
        const exp = await pool.query('select * from esmecursado join esmealumnos on esmecursado.id_alumno = esmealumnos.id  where esmecursado.id_clase= ?',[id])
        console.log(exp)
        res.json(exp)
    
    })
    router.get('/alumnosdelcursoclase/:id', async (req, res) => {
        const id = req.params.id

        ///id es la clase 
        clase = await pool.query('select * from esmeclases where id = ?',[id])

        curso = await pool.query('select * from esmecursos where id = ?',[clase[0]['id_curso']])

        cursado = await pool.query('select * from esmecursado where id_clase = ?',[curso[0]['id_curso']])

       // const exp = await pool.query('select * from esmecursado join esmealumnos on esmecursado.id_alumno = esmealumnos.id  where esmecursado.id_clase= ?',[id])
      
       const exp = await pool.query('select *  from ((esmeclases  join esmecursado on esmeclases.id_curso = esmecursado.id_clase)   join  esmealumnos on  esmecursado.id_alumno =  esmealumnos.id) join  esmeasistencia on esmeclases.id =  esmeasistencia.id_clasee  where esmeclases.id= ? and esmecursado.id_alumno = esmeasistencia.id_alumnoo',[id])
      
      // anteiro const exp = await pool.query('select *  from ((esmeclases  join esmecursado on esmeclases.id_curso = esmecursado.id_clase)   join  esmealumnos on  esmecursado.id_alumno =  esmealumnos.id) left join  esmeasistencia on esmecursado.id_alumno =  esmeasistencia.id_alumnoo  where esmeclases.id= ?',[id])
          
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
    router.post('/asignarcurso', async (req, res) => {
        let {id,curso}= req.body
       try {
   
        
        const newLink = {
            id_alumno:id,
            id_clase:curso
        }
        console.log(newLink)
      await pool.query('insert esmecursado set ?', newLink)
    
            
        
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


            router.post('/ponerpresente', async (req, res) => {
                let {id_alumnoo,id_clasee }= req.body
               try {
             console.log(id_alumnoo)
             console.log(id_clasee)
                existe = await pool.query('select * from esmeasistencia where id_alumnoo = ? and id_clasee = ?',[id_alumnoo,id_clasee])
                console.log(existe)
                if (existe.length >0){
                    const newLink = {
                        otroo:'Presente'
                       
                    }

                    await pool.query('UPDATE esmeasistencia set ? WHERE id_alumnoo = ? and id_clasee = ?', [newLink, id_alumnoo,id_clasee])
                }else{
                const newLink = {
                    id_alumnoo:id_alumnoo,
                    id_clasee:id_clasee,
                    otroo:'Presente'
                   
                }
               
              await pool.query('insert esmeasistencia set ?', newLink)
            }
            
                    
                
                    res.send('todo ok ')
               } catch (error) {
                console.log(error)
               }
               
               
                
                })
                router.post('/ponerausente', async (req, res) => {
                    let {id_alumnoo,id_clasee }= req.body
                   try {
               
                    existe = await pool.query('select * from esmeasistencia where id_alumnoo = ? and id_clasee = ?',[id_alumnoo,id_clasee])
                    console.log(existe)
                    if (existe.length >0){
                        const newLink = {
                            otroo:'Ausente'
                           
                        }

                        await pool.query('UPDATE esmeasistencia set ? WHERE id_alumnoo = ? and id_clasee = ?', [newLink, id_alumnoo,id_clasee])
                    }else{
                    const newLink = {
                        id_alumnoo:id_alumno,
                        id_clasee:id_clase,
                        otroo:'Ausente'
                       
                    }
                   
                  await pool.query('insert esmeasistencia set ?', newLink)
                }
                
                        
                    
                        res.send('todo ok ')
                   } catch (error) {
                    console.log(error)
                   }
                   
                   
                    
                    })


            

module.exports = router