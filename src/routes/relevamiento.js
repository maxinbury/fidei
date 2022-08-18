const express = require('express')
const router = express.Router()
const pool = require('../database')




router.post("/datos", async (req, res) => {
    const { barrio } = req.body
   
    const datos = await pool.query('SELECT * FROM relevamiento where zona  = ?', [barrio])

    let cdenuncia = 0
    let sdenuncia = 0
    let enproceso = 0

    let uno = 0
    let dos = 0
    let tres = 0
    console.log(datos[0]['Rango_Antiguedad'])
    for (var i = 0; i < datos.length; i++) {
     
    
        switch (datos[i]['Status']) {
            case "Denuncia":
                cdenuncia=cdenuncia+1

                break;
            case "SinDenuncia":
                sdenuncia=sdenuncia+1
                break;
                case "EnProceso":
                    enproceso=enproceso +1
                    break;
            default:
                break;
        }
        switch (datos[i]['Rango_Antiguedad']) {
            case "0-4":
                uno=uno+1

                break;
            case "4-8":
                dos=dos+1
                break;
                case "8-12":
                    tres=tres +1
                    break;
            default:
                break;
        }


        
    }
            porcD =  (cdenuncia/datos.length*100).toFixed(2)
          
            porcSD =  (sdenuncia/datos.length*100).toFixed(2)
            porcEP = (enproceso/datos.length*100).toFixed(2)

    const status = {
        "familias":  datos.length,

        "cdenuncia": cdenuncia,
        "porcDenuncia":porcD,

        "SinDenuncia":sdenuncia,
        "porcSDenuncia":porcSD,

        "EnProceso": enproceso,
        "porcEnProceso":porcEP

    }

    unoo = {
        rango: "0-4",
        cantidad: uno,
    }
    doss={
        rango: "4-8",
        cantidad: uno, 
    }
    tress={
        rango: "8-12",
        cantidad: tres,
     }
    
     const rangoo =[unoo,doss,tress]
  
    const rta =[status,rangoo,datos]
    console.log(rta)
    res.json(rta)


})


router.post("/cargar", async (req, res) => {
    const { Zona, Material_Construccion,Status,Rango_Antiguedad,Observaciones, Familia } = req.body
   const newDato ={
    Zona, Material_Construccion,Status,Rango_Antiguedad,Observaciones, Familia 
   }
   
   try {
    await pool.query('INSERT INTO relevamiento SET ?', [newDato]);
    res.send('Cargado correctamente!')
   } catch (error) {
    res.send('Algo Salio mal')
   }
  

    

})

router.post("/borrardatoszona", async (req, res) => {
    const { Zona} = req.body
 
   try {
    await pool.query('DELETE FROM relevamiento WHERE zona = ?', [Zona])
    res.send('Borrado correctamente!')
   } catch (error) {
    res.send('Algo Salio mal')
   }
  

    

})




module.exports = router
