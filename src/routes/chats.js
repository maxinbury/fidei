const express = require('express')
const router = express.Router()
const pool = require('../database')

const { isLoggedIn } = require('../lib/auth')
const {noleidos, conversacion, postenviar} =require('../controladores/chatsControlador')




router.get("/noleidos", isLoggedIn, noleidos)


router.get("/conversacion/:cuil_cuit", isLoggedIn, conversacion)



router.post('/chatenviar', postenviar)



module.exports = router
