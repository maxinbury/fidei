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

    


    let cuil_cuit_distinto = 'No'
    let monto_distinto = 'No'
    let monto_inusual = 'No'


    const cuota = await pool.query('select * from cuotas where id = ?', [id]) //objeto cuota
    aux = '%' + cuota[0]["cuil_cuit"] + '%'
    
    cuil_cuit = cuota[0]["cuil_cuit"]
    let cuota_con_ajuste = cuota[0]["cuota_con_ajuste"]
    let saldo_realc = cuota[0]["Saldo_real"]
    let nro_cuota = cuota[0]["nro_cuota"]
    let id_lote = cuota[0]["id_lote"]
    let Amortizacion = cuota[0]["Amortizacion"]







    mes = cuota[0]["mes"]
    anio = cuota[0]["anio"]

    estado = 'A'

    if (cuota[0]['parcialidad'] === 'Final') {
        /// traer la ultima

        ///
        console.log(aux)
        let cliente = await pool.query('Select * from clientes where cuil_cuit like ? ', [aux])
        ///////////////////CONSIDERAR PEP

        montomax = cliente[0]['ingresos'] * 0.3
        console.log(montomax)
        if (montomax < monto) {

            monto_inusual = 'Si'
        }

        const id_cuota = id

        
        


        const newLink = {
            id_cuota,
            monto,
            cuil_cuit,
            mes,
            estado: estado,
            anio,
        
            cuil_cuit_distinto,
            monto_distinto,
            monto_inusual,
            ubicacion: formData.file.originalFilename,///////////aca ver el problema

        };

        await pool.query('INSERT INTO pagos SET ?', [newLink]);



        let pago = cuota[0]["pago"] + parseFloat(monto)



        try {

            ////compara si ya supero el 
            if (cuota_con_ajuste < parseFloat(cuota[0]["pago"]) + parseFloat(monto)) {
                console.log('antes')
                Saldo_real = (parseFloat(cuota[0]["saldo_inicial"]) - parseFloat(Amortizacion)).toFixed(2)

                diferencia = parseFloat(cuota[0]["pago"]) + parseFloat(monto) - cuota_con_ajuste


            } else {
                console.log('no pasa')
                Saldo_real = parseFloat(saldo_realc) - parseFloat(monto)
                diferencia = parseFloat(cuota[0]["pago"]) + parseFloat(monto) - cuota_con_ajuste

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

            pago = pago - monto
            //  diferencia = parseFloat(cant_finales[nro_cuota - 1]["diferencia"])
            ///
            bandera = true
            console.log(bandera)
            if (nro_cuota < cant_finales.length) {
                if (pago < monto + pago - diferencia) { // si el pago ya superó el total }


                    for (ii = (nro_cuota); ii < cant_finales.length; ii++) {
                        console.log(ii)
                        if (diferencia > 0) {
                            //saldo real seria Saldo

                            saldo_realc = (parseFloat(cant_finales[ii]["Saldo_real"]) - monto - pago + diferencia).toFixed(2)

                            idaux = cant_finales[ii]["id"]
                            a = ii
                            //  Saldo_real = saldo_realc - monto

                            update = {
                                Saldo_real: saldo_realc,

                            }
                            console.log(update)


                            await pool.query('UPDATE cuotas set  ? WHERE id = ?', [update, idaux])

                        } /*else  {

                            // aux = await pool.query('select *from cuotas WHERE id_lote = ? and nro_cuota=?', [id_lote, i]) //cuota concurrente
                            //  cuota_con_ajuste = cant_finales[ii]["cuota_con_ajuste"]
                            saldo_realc = (parseFloat(cant_finales[ii]["Saldo_real"]) - monto).toFixed(2)
                        } */





                    }
                }

            }




        } catch (error) {
            console.log(error)
        }


        const mensaje = 'Enviado!'
     
     





    } else {
        const mensaje = 'Error la cuota no existe o no esta calculada'
       


    }

    /////
} catch (error) {
    console.log(error)
    const mensaje = 'Error  indeterminado'
  
}
 

  }


  
  exports.pagodecuota = pagodecuota