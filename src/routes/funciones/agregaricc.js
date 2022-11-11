



const express = require('express')
const router = express.Router()
const pool = require('../../database')









async function calcularicc (todas,ICC) {

let cuota  ={}
    console.log('todas')
    console.log(todas)
  
        const parcialidad = "Final"
        nro_cuota = todas["nro_cuota"]
        cuil_cuit = todas["cuil_cuit"]
     
        if (nro_cuota == 1) {
            
            saldo_inicial = todas["saldo_inicial"]
            const Ajuste_ICC = 0
            const Base_calculo = todas["Amortizacion"]
            const cuota_con_ajuste = todas["Amortizacion"]
            diferencia = - cuota_con_ajuste
             cuota = {
                ICC,
                Ajuste_ICC,
                Base_calculo,
                cuota_con_ajuste,
                diferencia,
                parcialidad
    
            }

        } else {
            const anterior = await pool.query('Select * from cuotas where nro_cuota = ? and cuil_cuit = ? and id_lote = ?', [nro_cuota - 1, cuil_cuit,todas["id_lote"]])
          console.log(anterior)
            var Saldo_real_anterior = parseFloat(anterior[0]["Saldo_real"])
            
            const cuota_con_ajuste_anterior = parseFloat(anterior[0]["cuota_con_ajuste"])
            
            const Base_calculo = cuota_con_ajuste_anterior
            const Ajuste_ICC =  (cuota_con_ajuste_anterior * ICC).toFixed(2)
            console.log(Base_calculo)
            const cuota_con_ajuste = (parseFloat(cuota_con_ajuste_anterior) + parseFloat(Ajuste_ICC)).toFixed(2)
     
            Saldo_real_anterior = (parseFloat(Saldo_real_anterior) +  parseFloat(Ajuste_ICC))
            console.log(typeof Saldo_real_anterior )
            console.log(Ajuste_ICC )
            console.log(Saldo_real_anterior )
            const Saldo_real = parseFloat(Saldo_real_anterior).toFixed(2)
         

            diferencia = - cuota_con_ajuste
             cuota = {
                ICC,
                Ajuste_ICC,
                Base_calculo,
                cuota_con_ajuste,
                Saldo_real,
                parcialidad,
                diferencia,
    
            }
           
        }
    
        try {
  
            await pool.query('UPDATE cuotas set ? WHERE id = ?', [cuota, todas["id"]])
      

        } catch (error) {
            console.log(error)
           

        }



  

}





exports.calcularicc = calcularicc