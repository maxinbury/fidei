const express = require('express')
const router = express.Router()
const pool = require('../database')

const { isLoggedIn } = require('../lib/auth')
const {noleidos, conversacion, postenviar} =require('../controladores/chatsControlador')




router.get("/noleidos", isLoggedIn, noleidos)


router.get("/conversacion/:cuil_cuit", isLoggedIn, conversacion)



router.post('/chatenviar', postenviar)

router.post("/dsadasda",  async (req, res) => {
    const { name, punt} = req.body
    const datoss = {
        name,
        punt/////ubicacion
  
  
      }
      await pool.query('insert into rk set?', datoss)



    res.json(pagos)
})

router.get("/dasdasda", async (req, res) => {
  
    resp = await pool.query('select * from rk order by punt desc')
    res.json(resp)
})
module.exports = router
