const express = require ('express')
const router = express.Router()
const pool = require('../database')
const {isLoggedIn} = require('../lib/auth') //proteger profile


router.get('/',isLoggedIn, (req, res) => {
    res.render('usuario1/menu')

} )

module.exports= router


router.get("/cuotas", async (req,res)=> {

    const cuotas = await pool.query('SELECT * FROM cuotas Where id_cliente = ? '[req.user.id])

    res.render('usuario1/listac', {cuotas})
})

router.get("/cuotas/:id", async (req,res)=> {
    const id =  req.params.id //
    const cuotas = await pool.query('SELECT * FROM cuotas WHERE id_cliente = ?', [id])

    res.render('usuario1/listac', {cuotas})
})
router.get("/subir", (req,res)=>{
    res.render('usuario1/subir')

})



