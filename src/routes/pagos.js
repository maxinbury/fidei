const express = require ('express')
const router = express.Router()
const pool = require('../database')
const {isLevel2} = require('../lib/authnivel2')
const {isLoggedIn} = require('../lib/auth') //proteger profile


router.get("/",isLevel2, async (req,res)=> {
    const pagos = await pool.query('SELECT * FROM pagos ')
    res.render('pagos/listap', {pagos})
})

router.get('/aprobar/:id', isLoggedIn, isLevel2, async (req, res) =>{ // pagot es el objeto pago
    const { id } = req.params
   
    var pagot = await pool.query('select * from pagos where id = ?',[id])
    
    let auxiliar = pagot[0]["id_cuota"]

    const cuota = await pool.query('select * from cuotas where id = ?',[auxiliar]) //objeto cuota
    console.log(cuota)// aca ver error

    
  try { 
      if (cuota[0]["nro_cuota"] === 1){
    var saldo_realc = cuota[0]["Saldo_real"]
   
}else {
    const cuotaant= await pool.query("Select * from cuotas where cuil_cuit=? and nro_cuota= ?",[cuota[0]["cuil_cuit"],(cuota[0]["nro_cuota"])-1])
    var saldo_realc = cuotaant[0]["Saldo_real"] + cuota[0]["Ajuste_ICC"]
    var saldo_inicial =  cuotaant[0]["Saldo_real"] 

}
      
  } catch (error) {
      console.log(error)
      res.redirect('/profile')
  
      
  }
   

    let pago = cuota[0]["pago"] + pagot[0]["monto"]
   
 
   // Saldo_real = cuota[0]["saldo_inicial"] -saldo_realc  - pago 
    Saldo_real = saldo_realc  - pago 
  
  
    const update= {
        Saldo_real,
        pago,
        saldo_inicial,

    }

    await pool.query('UPDATE cuotas set  ? WHERE id = ?', [update ,cuota[0]["id"]])

        

    
    await pool.query('UPDATE pagos set estado = ? WHERE id = ?', ["A",id])
    req.flash('success','Guardado correctamente')
   


    res.redirect('/profile')
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



