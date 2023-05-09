const express = require('express')
const router = express.Router()
const pool = require('../database')
const { isLevel2 } = require('../lib/authnivel2')
const { isLoggedIn } = require('../lib/auth')
const {noleidos, conversacion, postenviar} =require('../controladores/chatsControlador')




router.get("/noleidos", isLoggedIn,isLevel2, noleidos)


router.get("/conversacion/:cuil_cuit", isLoggedIn,isLevel2, conversacion)



router.post('/chatenviar', postenviar)



module.exports = router
