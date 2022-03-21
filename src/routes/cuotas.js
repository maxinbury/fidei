const express = require ('express')
const router = express.Router()
const pool = require('../database')


router.get("/:id", async (req,res)=> {
    const id =  req.params.id //
    const cuotas = await pool.query('SELECT * FROM cuotas WHERE id_cliente = ?', [id])
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

//-----

router.post('/cuotas', async(req, res, next) =>{
    const { id } = req.body
    const rows = await pool.query ('SELECT * FROM cuotas WHERE id_cliente = ?',[id])
       console.log(id)
        if (rows.length > 0){
            res.redirect(`../cuotas/${id}`)
           // res.render('links/list', {rows})
           //
           //const { id } = req.params
           //const links = await pool.query('SELECT * FROM clientes WHERE id= ?', [id])

    }else {res.redirect('clientes')}
    
})
module.exports= router 


