const express = require ('express')
const router = express.Router()
const pool = require('../database')
const {isLevel2} = require('../lib/authnivel2')
const {isLoggedIn} = require('../lib/auth') //proteger profile

router.get("/",isLevel2, async (req,res)=> {
    const pagos = await pool.query('SELECT * FROM pagos ')
    res.render('pagos/listap', {pagos})
})

router.get('/aprobar/:id', isLoggedIn, async (req, res) =>{
    const { id } = req.params
    await pool.query('UPDATE pagos set estado = ? WHERE id = ?', ["A",id])
        req.flash('success','Guardado correctamente')
   
    res.render('pagos/pendientes')
})

router.get('/realizara/:dni',isLoggedIn,isLevel2, async (req, res) => {
    const dni =  req.params.dni // requiere el parametro id  c 
    const cliente = await pool.query('SELECT * FROM clientes WHERE dni= ?', [dni])
    console.log(cliente)
    res.render('pagos/realizara', {cliente})

} )
router.get('/realizar',isLoggedIn,isLevel2, async (req, res) => {
 
    res.render('pagos/realizar')

} )

router.get('/pendientes', isLoggedIn, isLevel2, async(req, res) => {
    const pendientes = await pool.query ("Select * from pagos where estado = 'P'")
    console.log(pendientes)
    res.render('pagos/pendientes', {pendientes})

})



router.post('/realizar', async (req, res)=>{
    const {monto,dni,comprobante, medio, lote} = req.body;
    const estado = 'A'
    const newLink = {
        monto,
        medio,
        dni,
        estado,
        comprobante,
        lote

    };
    console.log(newLink);
    const cliente =  await pool.query('SELECT * FROM clientes where dni = ?', [req.body.dni]);
    if (cliente.length > 0){
        const cantidad = await pool.query('SELECT count(*) FROM pagos WHERE (dni = 34825125 and lote = 1) ',[dni, lote])
        const nro_cuota = cantidad[0]['count(*)'] + 1

        await pool.query('INSERT INTO pagos SET ?', [newLink]);
        req.flash('success','Guardado correctamente')
        res.redirect(`../links/clientes`);

       
        


    }else{req.flash('message','Error, cliente no existe')
    res.redirect(`../links/clientes`) }


})





module.exports= router



