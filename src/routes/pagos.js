const express = require ('express')
const router = express.Router()
const pool = require('../database')
const {isLevel2} = require('../lib/authnivel2')
const {isLoggedIn} = require('../lib/auth') //proteger profile

router.get("/",isLevel2, async (req,res)=> {
    const pagos = await pool.query('SELECT * FROM pagos ')
    res.render('pagos/listap', {pagos})
})

router.get('/realizar/:id',isLoggedIn,isLevel2, async (req, res) => {
    const id =  req.params.id // requiere el parametro id 
    const cliente = await pool.query('SELECT * FROM clientes WHERE id= ?', [id])
    console.log(cliente)
    res.render('pagos/realizar', {cliente})

} )




router.post('/realizar', async (req, res)=>{
    const {monto,dni,comprobante} = req.body;
    const estado = 'A'
    const newLink = {
        monto,
        dni,
        estado,
        comprobante

    };
    console.log(newLink);
    const cliente =  await pool.query('SELECT * FROM clientes where dni = ?', [req.body.dni]);
    if (cliente.length > 0){
    
        await pool.query('INSERT INTO pagos SET ?', [newLink]);
        req.flash('success','Guardado correctamente')
        res.redirect(`../links/clientes`);

    }else{req.flash('message','Error, cliente no existe')
    res.redirect(`../links/clientes`) }


})





module.exports= router



