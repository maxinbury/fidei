const express = require ('express')
const router = express.Router()
const pool = require('../database')
const {isLevel2} = require('../lib/authnivel2')
const {isLoggedIn} = require('../lib/auth') //proteger profile

router.get("/",isLevel2, async (req,res)=> {
    const pagos = await pool.query('SELECT * FROM pagos ')
    res.render('pagos/listap', {pagos})
})

router.get('/realizar',isLoggedIn,isLevel2, (req, res) => {
    res.render('pagos/realizar')

} )



router.post('/realizar', async (req, res)=>{
    const {monto,dni, } = req.body;
    const newLink = {
        monto,
        dni
    };
    console.log(newLink);
    const cliente =  await pool.query('SELECT * FROM clientes where dni = ?', [req.body.dni]);
    if (cliente.length > 0){
    
        await pool.query('INSERT INTO pagos SET ?', [newLink]);
        req.flash('success','Guardado correctamente')
        res.redirect('/pagos');

    }else{req.flash('message','Error, cliente no existe')
    res.redirect('/pagos') }


})



module.exports= router



