const express = require ('express')
const router = express.Router()
const pool = require('../database')


router.get("/", async (req,res)=> {
    const cuotas = await pool.query('SELECT * FROM cuotas')
    console.log(cuotas)
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

router.get('/delete/:id', async (req, res)=>{
    const { id } =req.params
    await pool.query('DELETE FROM cuotas WHERE ID = ?', [id])
    req.flash('success', 'Cuotas eliminadas')
    res.redirect('/cuotas')
})


module.exports= router 


