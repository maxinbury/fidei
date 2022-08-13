const express = require('express')
const router = express.Router()
const pool = require('../database')




router.post("/datos", async (req, res) => {
    const { barrio } = req.body
   
    const datos = await pool.query('SELECT * FROM relevamiento where zona  = ?', [barrio])

    let cdenuncia = 0
    let sdenuncia = 0
    let enproceso = 0
    for (var i = 0; i < datos.length; i++) {
      
       //console.log(datos[i]['Status'])
        switch (datos[i]['Status']) {
            case "Denuncia":
                cdenuncia=+1
                break;
            case "SinDenuncia":
                sdenuncia+=1
                break;
                case "EnProceso":
                    enproceso+=1
                    break;
            default:
                break;
        }
        
    }

    const status = {
        "cdenuncua": cdenuncia,
        "SinDenuncia":sdenuncia,
        "EnProceso": enproceso

    }
    const rta =[status]
//    console.log(rta)
    res.send(rta)


})






module.exports = router
