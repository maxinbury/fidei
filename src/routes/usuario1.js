const express = require ('express')
const router = express.Router()
const pool = require('../database')
const {isLoggedIn} = require('../lib/auth') //proteger profile

router.get('/',isLoggedIn, (req, res) => {
    res.render('usuario1/menu')

} )

router.get("/cuotas", async (req,res)=> {

    const cuotas = await pool.query('SELECT * FROM cuotas WHERE dni = ?',[req.user.dni])
    console.log(cuotas)
    res.render('usuario1/listac', {cuotas})

})

router.get("/edit", (req,res)=>{
    res.render('usuario1/edit')

})

router.get("/subir", (req,res)=>{
    res.render('usuario1/subir')

})

router.post('/realizar', async (req, res)=>{
    const {monto,comprobante} = req.body;
    const dni = req.user.dni
    const estado = 'P'
    const newLink = {
        monto,
        dni,
        estado,
        comprobante

    };
        await pool.query('INSERT INTO pagos SET ?', [newLink]);
        req.flash('success','Guardado correctamente, tu solicitud sera procesada y se notificará al confirmarse')
        res.redirect(`/usuario1`);

})

router.post('/addcbu', async(req, res) => {

    const {cbu, lazo,} = req.body;
    const dni = req.user.dni
    const estado ="P"
    const newcbu = {
        dni,
        lazo,
        cbu
    }

        await pool.query('INSERT INTO cbu SET ?', [newcbu])
        req.flash('success','Guardado correctamente, tu solicitud sera procesada y se notificará al confirmarse')
        res.redirect(`/usuario1`);
    })



module.exports= router

