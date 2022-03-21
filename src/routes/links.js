const express = require ('express')
const router = express.Router()
const pool = require('../database')
const {isLoggedIn} = require('../lib/auth') //proteger profile


router.get('/add',isLoggedIn, (req, res) => {
    res.render('links/add')

} )

router.get('/clientes',isLoggedIn, (req, res) => {
    res.render('links/clientes')

} )
//editar

router.get('/edit/:id', isLoggedIn, async (req, res) =>{
    const { id } = req.params
    const links = await pool.query('SELECT * FROM clientes WHERE id= ?', [id])
   
    res.render('links/edit',{link: links[0]})
})



router.get("/:id",isLoggedIn,  async (req,res)=> {
    const id =  req.params.id // requiere el parametro id 
    const links = await pool.query('SELECT * FROM clientes WHERE id= ?', [id]) //[req.user.id]
    res.render('links/list', {links})
})


router.post('/add', isLoggedIn, async (req, res)=>{
    const {Nombre, Apellido, Direccion} = req.body;
    const newLink = {
        Nombre,
        Apellido,
        Direccion
        //user_id: req.user.id
    };
  
    await pool.query('INSERT INTO clientes set ?', [newLink]);
  // await pool.query('INSERT INTO clientes set Nombre="nombre", Apellido = "apellido", Direccion="dir"')
    req.flash('success','Guardado correctamente')
    res.redirect('/links');


})
//borrar de lista
router.get('/delete/:id', isLoggedIn, async (req, res)=>{
    const { id } =req.params.id
    await pool.query('DELETE FROM clientes WHERE ID = ?', [id])
    req.flash('success', 'Cliente eliminado')
    res.redirect('/links')
})


router.post('/edit/:id', async(req,res)=>{
    const { id } = req.params
    const {Nombre, Apellido, Direccion } = req.body
    const newLink ={
        Nombre,
        Apellido,
        Direccion
    }
    await pool.query('UPDATE clientes set ? WHERE id = ?', [newLink,id])
    req.flash('success', 'Cliente modificado correctamente')
    res.redirect('/links')
})



// buscar cliente por apellido no esta conectado
router.post('/listapp',isLoggedIn, async(req, res, next) =>{
    const { id } = req.body
    const rows = await pool.query ('SELECT * FROM users WHERE id = ?',[id])
       console.log(id)
        if (rows.length > 0){
            res.redirect(`/links/${id}`)
           // res.render('links/list', {rows})
           //
           //const { id } = req.params
           //const links = await pool.query('SELECT * FROM clientes WHERE id= ?', [id])

    }else {res.redirect('clientes')}
})

module.exports= router



