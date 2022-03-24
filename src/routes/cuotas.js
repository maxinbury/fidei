const express = require ('express')
const router = express.Router()
const pool = require('../database')
const {isLevel2} = require('../lib/authnivel2')


router.get("/cuotas/:id", async (req,res)=> {
    const id =  req.params.id //
    const cuotas = await pool.query('SELECT * FROM cuotas WHERE id_cliente = ?', [id])
    console.log(cuotas)
    res.render('cuotas/lista', {cuotas})
})


//probando rol
router.get("/",isLevel2, async (req,res)=> {
    const cuotas = await pool.query('SELECT * FROM cuotas ')
    res.render('cuotas/lista', {cuotas})
})

router.get('/add', (req, res) => {
    res.render('cuotas/add')

} )

router.post('/add', async (req, res)=>{
    const {saldo_inicial, saldo_cierre, id_cliente, monto} = req.body;
    const newLink = {
        saldo_inicial,
        saldo_cierre,
        id_cliente,
        monto
    };
    console.log(newLink);
    await pool.query('INSERT INTO cuotas SET ?', [newLink]);
 
    req.flash('success','Guardado correctamente')
    res.redirect('/cuotas');


})
router.post('/addaut', async (req, res)=>{
    const {id_cliente, monto_total, cantidad_cuotas} = req.body;
    const monto_cuota = monto_total/cantidad_cuotas;
    var nro_cuota = 1
    var saldo_inicial = monto_total
    
    var saldo_cierre= saldo_inicial - monto_cuota
    for (var i= 1 ; i<=cantidad_cuotas; i ++) {  
        nro_cuota = i
        const newLink = {
            nro_cuota,
            saldo_inicial,
            saldo_cierre,
            id_cliente,
        };

        console.log(newLink);
        await pool.query('INSERT INTO cuotas SET ?', [newLink]);

        saldo_inicial -= monto_cuota
        saldo_cierre= saldo_inicial - monto_cuota
     }
    
    
 
    req.flash('success','Guardado correctamente')
    res.redirect('/cuotas');


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


