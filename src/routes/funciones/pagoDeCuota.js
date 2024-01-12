const formidable = require('formidable');

const express = require('express')
const router = express.Router()
const pool = require('../../database')
const XLSX = require('xlsx')
const path = require('path')
const fs = require('fs')
const ponerguion = require('../../public/apps/transformarcuit')
const sacarguion = require('../../public/apps/transformarcuit')





async function pagodecuota (id,monto) {

    //id es de cuotacuota

    try {
        //// realizar el pago




        let monto_inusual = 'No'
        let mensaje =''

        const cuota = await pool.query('select * from cuotas where id = ?', [id]) //objeto cuota
        aux = '%' + cuota[0]["cuil_cuit"] + '%'

        cuil_cuit = cuota[0]["cuil_cuit"]
        let cuota_con_ajuste = cuota[0]["cuota_con_ajuste"]
        let saldo_realc = cuota[0]["Saldo_real"]
        Saldo_real = parseFloat(cuota[0]["Saldo_real"])
        let nro_cuota = cuota[0]["nro_cuota"]
        let id_lote = cuota[0]["id_lote"]
        let Amortizacion = cuota[0]["Amortizacion"]
        let diferencia = cuota[0]["diferencia"]






        mes = cuota[0]["mes"]
        anio = cuota[0]["anio"]

        estado = 'A'

        if (cuota[0]['parcialidad'] === 'Final') {
            /// traer la ultima

            ///
        
            let cliente = await pool.query('Select * from clientes where cuil_cuit like ? ', [aux])
            ///////////////////CONSIDERAR PEP

            montomax = cliente[0]['ingresos'] * 0.3
         
            if (montomax < monto) {

                monto_inusual = 'Si'
            }

            const id_cuota = id





            let pago = cuota[0]["pago"] + parseFloat(monto)

            ////////fin guardado del pago

            try {

                ////compara si ya supero el 
                actualizacion = diferencia
                if (cuota_con_ajuste < parseFloat(cuota[0]["pago"]) + parseFloat(monto)) {
                    /////////compara si con este nuevo pago se supera el monto(o con el anteroir)
             /////////ver que (si pasa se reste la diferencia
          
         
                    if (diferencia<0){ //si aun  no habia pasado la amortizacion y con este pago pasa
                     
                        Saldo_real = Saldo_real + diferencia
                   
                        saldo_inicial = Saldo_real
                        auxiliar = -diferencia
                        diferencia =(diferencia+ parseFloat(monto)).toFixed(2)
                    }else{/// si ya paso la amortizacion y no hay que actualizar 
                        diferencia =(diferencia+ parseFloat(monto)).toFixed(2)

                    }
             
                    Saldo_real = (parseFloat(cuota[0]["saldo_inicial"]) - parseFloat(Amortizacion)).toFixed(2)
                    //
                  //  Saldo_real = Saldo_real + diferencia
            
                    


                } else {
                 
                    Saldo_real = parseFloat(saldo_realc) - parseFloat(monto)
                    diferencia =(diferencia+ parseFloat(monto)).toFixed(2)
                    saldo_inicial= Saldo_real

                }
               
                if (actualizacion<0){/// hay que actualizar el resto 
                 
                  
                    if ((actualizacion+parseFloat(monto)) <=0  ){// si no pasa junto con el monto
                       
                    
                        actualizacion =  monto
                    }else {
                        actualizacion = auxiliar
                    }
                    

                }else{
                    actualizacion =0
                }
             
                pago = cuota[0]["pago"] + parseFloat(monto)

                update = {
                    Saldo_real,
                    pago,
                    diferencia
                }
                await pool.query('UPDATE cuotas set  ? WHERE id = ?', [update, id])



                // Saldo_real = cuota[0]["saldo_inicial"] -saldo_realc  - pago 



                /*  const update = {
                      Saldo_real,
                      pago,
                      diferencia
          
          
                  }
          
                  await pool.query('UPDATE cuotas set  ? WHERE id = ?', [update, cuota[0]["id"]])*/

                cant_finales = await pool.query('select * from cuotas  WHERE id_lote = ? and parcialidad = "Final" order by nro_cuota', [id_lote])

                pago = (pago - monto).toFixed(2)
                //  diferencia = parseFloat(cant_finales[nro_cuota - 1]["diferencia"])
                ///
                bandera = true
           
            
                if (nro_cuota < cant_finales.length) {
               
                    if (actualizacion >= 0) { // si el pago ya superó el total }
                      
                     
                        for (ii = (nro_cuota); ii <= (cant_finales.length-1); ii++) {
                            saldo_inicial = Saldo_real
                         
                           ////////////// si el pago ya excedio el monto   
                                //saldo real seria Saldo
                            
                                Saldo_real = (parseFloat(cant_finales[ii]["Saldo_real"]) -actualizacion).toFixed(2)
                             
                               // saldo_inicial = (parseFloat(cant_finales[ii]["saldo_inicial"]) +parseFloat(actualizacion)).toFixed(2)
                                idaux = cant_finales[ii]["id"]
                                a = ii
                                //  Saldo_real = saldo_realc - monto
                            
                                update = {
                                    Saldo_real,
                                    saldo_inicial
                                }
                              


                                await pool.query('UPDATE cuotas set  ? WHERE id = ?', [update, idaux])

                            




                        }
                    }

                }




            } catch (error) {
              //  console.log(error)
            }


             mensaje = 'Enviado!'
           // res.json([mensaje, cuil_cuit])







        } else {
             mensaje = 'Error la cuota no existe o no esta calculada'
         //   res.json([mensaje, cuil_cuit])


        }

        /////
    }  catch (error) {
    //console.log(error)
     mensaje = 'Error  indeterminado'
  
}
 

  }


  async function pagodecuotaniv4 (id,monto,cantidad) {

    //id es de cuotacuota

    try {
        //// realizar el pago




        let monto_inusual = 'No'
       

        const cuota = await pool.query('select * from cuotas where id = ?', [id]) //objeto cuota
        aux = '%' + cuota[0]["cuil_cuit"] + '%'

        cuil_cuit = cuota[0]["cuil_cuit"]
        let cuota_con_ajuste = cuota[0]["cuota_con_ajuste"]
        let saldo_realc = cuota[0]["Saldo_real"]
        Saldo_real = parseFloat(cuota[0]["Saldo_real"])
        let nro_cuota = cuota[0]["nro_cuota"]
        let id_lote = cuota[0]["id_lote"]
        let Amortizacion = cuota[0]["Amortizacion"]
        let diferencia = cuota[0]["diferencia"]
        mes = cuota[0]["mes"]
        anio = cuota[0]["anio"]

        estado = 'A'


            let pago = cuota[0]["pago"] + parseFloat(monto)

            try {

                ////compara si ya supero el 
                actualizacion = diferencia
                if (cuota_con_ajuste < parseFloat(cuota[0]["pago"]) + parseFloat(monto)) {
                    /////////compara si con este nuevo pago se supera el monto(o con el anteroir)
             /////////ver que (si pasa se reste la diferencia
        
                    if (diferencia<0){ //si aun  no habia pasado la amortizacion y con este pago pasa
                        Saldo_real = Saldo_real + diferencia
                    
                        saldo_inicial = Saldo_real
                        auxiliar = -diferencia
                        diferencia =(diferencia+ parseFloat(monto)).toFixed(2)
                    }else{/// si ya paso la amortizacion y no hay que actualizar 
                        diferencia =(diferencia+ parseFloat(monto)).toFixed(2)

                    }
             
                    Saldo_real = (parseFloat(cuota[0]["saldo_inicial"]) - parseFloat(Amortizacion)).toFixed(2)
                    //
                  //  Saldo_real = Saldo_real + diferencia
            
                    


                } else {
                 
                    Saldo_real = parseFloat(saldo_realc) - parseFloat(monto)
                    diferencia =(diferencia+ parseFloat(monto)).toFixed(2)
                    saldo_inicial= Saldo_real

                }
               
                if (actualizacion<0){/// hay que actualizar el resto 
                 
                  
                    if ((actualizacion+parseFloat(monto)) <=0  ){// si no pasa junto con el monto
                       
                        actualizacion =  monto
                    }else {
                        actualizacion = auxiliar
                    }
                    

                }else{
                    actualizacion =0
                }
             
                pago = cuota[0]["pago"] + parseFloat(monto)

                update = {
                    Saldo_real,
                    pago,
                    diferencia
                }
                await pool.query('UPDATE cuotas set  ? WHERE id = ?', [update, id])


                cant_finales = await pool.query('select * from cuotas  WHERE id_lote = ? and parcialidad = "Final" order by nro_cuota', [id_lote])

                pago = (pago - monto).toFixed(2)
                //  diferencia = parseFloat(cant_finales[nro_cuota - 1]["diferencia"])
                ///
                bandera = true
           
                if (nro_cuota < cant_finales.length) {
                 
                 
                    if (actualizacion >= 0) { // si el pago ya superó el total }
                     
                     
                        for (ii = (nro_cuota); ii <= (cant_finales.length-1); ii++) {
                            saldo_inicial = Saldo_real
                           ////////////// si el pago ya excedio el monto   
                                //saldo real seria Saldo
                            
                                Saldo_real = (parseFloat(cant_finales[ii]["Saldo_real"]) -actualizacion).toFixed(2)
                             
                               // saldo_inicial = (parseFloat(cant_finales[ii]["saldo_inicial"]) +parseFloat(actualizacion)).toFixed(2)
                                idaux = cant_finales[ii]["id"]
                                a = ii
                                //  Saldo_real = saldo_realc - monto
                                update = {
                                    Saldo_real,
                                    saldo_inicial
                                }
                        


                                await pool.query('UPDATE cuotas set  ? WHERE id = ?', [update, idaux])

                            




                        }
                    }

                }




            } catch (error) {
             //   console.log(error)
            }


             mensaje = 'Enviado!'
           // res.json([mensaje, cuil_cuit])







      

        /////
    }  catch (error) {
    //console.log(error)
     mensaje = 'Error  indeterminado'
  
}
 

  }
  exports.pagodecuota = pagodecuota
  exports.pagodecuotaniv4 = pagodecuotaniv4