const express = require('express')
const router = express.Router()
const pool = require('../database')
const { isLoggedInn, isLoggedInn2 } = require('../lib/auth')



router.get('/todas',isLoggedInn2, async (req, res) => {

    try {
        const todas = await pool.query('select * from novedades ');
   
   
     
   
        res.json(todas)

    } catch (error) {
      //  console.log(error)
        res.json(error)
    }
  

    

})




router.get('/todosloschats',isLoggedInn2, async (req, res) => {

    try {
        const todas = await pool.query('select * from chats ');
   
   
     
   
        res.json(todas)

    } catch (error) {
       // console.log(error)
        res.json(error)
    }
  

    

})

router.get('/leerchat/:id',isLoggedInn2, async (req, res) => {
    const id = req.params.id

    try {
        const todas = await pool.query('select * from chats where id=?',[id]);
   
   
     
   
        res.json(todas)

    } catch (error) {
      //  console.log(error)
        res.json(error)
    }
  

    

})

router.get('/leer/:id',isLoggedInn2, async (req, res) => {
const id  =  req.params.id
    try {
        const todas = await pool.query('select * from novedades where id = ?',[id]);
   
   
     
   
        res.json(todas)

    } catch (error) {
       // console.log(error)
        res.json(error)
    }
  

    

})

router.post('/crear',isLoggedInn2, async (req, res) => {
    const  { detalle, cuil_cuit,asunto, dirigido  } = req.body;
   
    const mes =(new Date(Date.now())).toLocaleDateString()
 

    try {
      
       
     const nueva = {
        mes,
        detalle, 
        cuil_cuit,
        asunto,
         dirigido
     }
        
    await pool.query('insert into novedades set ?', nueva)
      
     res.json('Cargada con éxito')
    } catch (error) {
     //  console.log(error)
        res.send('Error algo sucedió')
    }

})





module.exports = router