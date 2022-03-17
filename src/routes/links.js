const express = require ('express')
const router = express.Router()
const pool = require('../database')
const {isLoggedIn} = require('../lib/auth') //proteger profile


router.get('/add',isLoggedIn, (req, res) => {
    res.render('links/add')

} )

router.get("/",isLoggedIn,  async (req,res)=> {
    const links = await pool.query('SELECT * FROM clientes') //[req.user.id]
    console.log(links)
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
    console.log(newLink);
    await pool.query('INSERT INTO clientes set ?', [newLink]);
  // await pool.query('INSERT INTO clientes set Nombre="nombre", Apellido = "apellido", Direccion="dir"')
    req.flash('success','Guardado correctamente')
    res.redirect('/links');


})
//borrar de lista
router.get('/delete/:id', isLoggedIn, async (req, res)=>{
    const { id } =req.params
    await pool.query('DELETE FROM clientes WHERE ID = ?', [id])
    req.flash('success', 'Cliente eliminado')
    res.redirect('/links')
})
//editar
router.get('/edit/:id', isLoggedIn, async (req, res) =>{
    const { id } = req.params
    const links = await pool.query('SELECT * FROM clientes WHERE id= ?', [id])
   
    res.render('links/edit',{link: links[0]})

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


module.exports= router