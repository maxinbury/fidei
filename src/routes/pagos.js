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

router.get('/realizara/:cuil_cuit',isLoggedIn,isLevel2, async (req, res) => {
    const cuil_cuit =  req.params.cuil_cuit // requiere el parametro id  c 
    const cliente = await pool.query('SELECT * FROM clientes WHERE cuil_cuit= ?', [cuil_cuit])
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
    const {monto,cuil_cuit,comprobante, medio, lote} = req.body;
    const estado = 'A'
 
    const cliente =  await pool.query('SELECT * FROM clientes where cuil_cuit = ?', [req.body.cuil_cuit]);
    console.log(cuil_cuit)
    console.log(lote)
    if (cliente.length > 0){
        const cantidad = await pool.query('SELECT count(*) FROM pagos WHERE (cuil_cuit = ? and lote = ?) ',[cuil_cuit, lote])
        const nro_cuota = (cantidad[0]['count(*)'] + 1) /////  ver si no tiene cuotas pendientes
        const validar_cuotas = await pool.query('SELECT count(*) FROM cuotas WHERE lote = ? and cuil_cuit = ? ', [lote,cuil_cuit])
        console.log(validar_cuotas)
        console.log(validar_cuotas[0]['count(*)'])
        if (validar_cuotas[0]['count(*)'] > 0){
        var id_cuota = (await pool.query ('SELECT id from cuotas where (nro_cuota = ? and lote = ? and cuil_cuit = ?)', [cantidad[0]['count(*)'] ,lote,cuil_cuit]))[0]['id']
        console.log(id_cuota)
        
        }else { 
            var id_cuota = 0 }

        const newLink = {
            monto,
            medio,
            cuil_cuit,
            estado,
            comprobante,
            lote, 
            nro_cuota,
            id_cuota
    
        };


        await pool.query('INSERT INTO pagos SET ?', [newLink]);
        req.flash('success','Guardado correctamente')
        res.redirect(`../links/clientes`);

       
        


    }else{req.flash('message','Error, cliente no existe')
    res.redirect(`../links/clientes`) }


})





module.exports= router



