



const express = require('express')
const router = express.Router()
const pool = require('../../database')









async function calcularicc (todas,ICC) {
   
let cuota  ={}
   
try {
  
        const parcialidad = "Final"
        nro_cuota = todas["nro_cuota"]
        cuil_cuit = todas["cuil_cuit"]
        Saldo_real = todas["Saldo_real"]
        
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
            
            let Saldo_real_anterior = parseFloat(anterior[0]["Saldo_real"])
            saldo_inicial = Saldo_real_anterior
            const cuota_con_ajuste_anterior = parseFloat(anterior[0]["cuota_con_ajuste"])
            
            const Base_calculo = cuota_con_ajuste_anterior
            const Ajuste_ICC =  (cuota_con_ajuste_anterior * ICC).toFixed(2)
       
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
                saldo_inicial,
    
            }
           
        }
    

  
            await pool.query('UPDATE cuotas set ? WHERE id = ?', [cuota, todas["id"]])
            todass =   await pool.query('select * from  cuotas WHERE id_lote = ?', [ todas["id_lote"]])
           console.log(todass.length)
            if (todass.length> todas['nro_cuota'] ){
              
                console.log(Saldo_real)
                console.log(Saldo_real)
                if (todas['nro_cuota']>1 ){
                cuotaa = {
                    saldo_inicial:cuota.Saldo_real,
                    Saldo_real:cuota.Saldo_real,
                    
        
                }}else {
                    cuotaa = {
                        saldo_inicial:Saldo_real,
                        Saldo_real
                        
            
                    

                }}
                 console.log(cuotaa)
                await pool.query('UPDATE cuotas set ? WHERE id_lote = ? and nro_cuota>?', [cuotaa, todas["id_lote"],todas["nro_cuota"]])
                console.log(typeof(todas['nro_cuota']))
            }

        } catch (error) {
            console.log(error)
           

        }

 


  

}





exports.calcularicc = calcularicc