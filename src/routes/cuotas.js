const express = require ('express')
const router = express.Router()
const pool = require('../database')
const {isLevel2} = require('../lib/authnivel2')
const {isLoggedIn} = require('../lib/auth') //proteger profile

router.get("/cuotas/:id",isLoggedIn, async (req,res)=> {
    const id =  req.params.id //
    const cuotas = await pool.query('SELECT * FROM cuotas WHERE id_cliente = ?', [id])
    res.render('cuotas/lista', {cuotas})
})


router.get("/",isLevel2,isLoggedIn, async (req,res)=> {
    const cuotas = await pool.query('SELECT * FROM cuotas ')
    res.render('cuotas/lista', {cuotas})
})

router.get('/add',isLoggedIn, (req, res) => {
    res.render('cuotas/add')

} )

router.post('/add', async (req, res)=>{
    const {saldo_inicial, saldo_cierre, dni, monto} = req.body;
    const newLink = {
        saldo_inicial,
        saldo_cierre,
        dni
    };
    console.log(newLink);
    await pool.query('INSERT INTO cuotas SET ?', [newLink]);
 
    req.flash('success','Guardado correctamente')
    res.redirect('/cuotas');


})
router.post('/addaut', async (req, res)=>{
    const {dni, monto_total, cantidad_cuotas} = req.body;
    const monto_cuota = monto_total/cantidad_cuotas;
    var nro_cuota = 1
    var saldo_inicial = monto_total
    const row =  await pool.query('SELECT * from clientes where dni = ?', [req.body.dni])  
    if (row.length > 0){ 
    var saldo_cierre= saldo_inicial - monto_cuota
    const id_cliente = row[0].id 
   
    for (var i= 1 ; i<=cantidad_cuotas; i ++) {  
        nro_cuota = i
        const newLink = {
            nro_cuota,
            saldo_inicial,
            saldo_cierre,
            dni,
            id_cliente
        };
        
       await pool.query('INSERT INTO cuotas SET ?', [newLink]);

        saldo_inicial -= monto_cuota
        saldo_cierre= saldo_inicial - monto_cuota
     }req.flash('success','Guardado correctamente')
     res.redirect('/cuotas')}
     
     else{
        req.flash('message','Error cliente no existe')
        res.redirect('/cuotas/add')}
     })



router.get('/delete/:id', async (req, res)=>{
    const { id } =req.params
    await pool.query('DELETE FROM cuotas WHERE ID = ?', [id])
    req.flash('success', 'Cuotas eliminadas')
    res.redirect('/cuotas')
})

//-----

router.post('/cuotas', async(req, res, next) =>{
    const { id } = req.body
    const rows = await pool.query ('SELECT * FROM cuotas WHERE id_cliente = ?',[id])
       console.log(id)
        if (rows.length > 0){
            res.redirect(`../cuotas/${id}`)
      

    }else {res.redirect('clientes')}
    
})
module.exports= router 


