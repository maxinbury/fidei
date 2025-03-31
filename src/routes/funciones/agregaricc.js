



const express = require('express')
const router = express.Router()
const pool = require('../../database')







async function calcularicc(todas, ICC) {
    let cuota = {};
  
    try {
        ICC = ICC / 100;
        const parcialidad = "Final";
        const nro_cuota = todas["nro_cuota"];
        const cuil_cuit = todas["cuil_cuit"];
        let Saldo_real = todas["Saldo_real"];

        if (nro_cuota == 1) {
            const saldo_inicial = todas["saldo_inicial"];
            const Ajuste_ICC = 0;
            const Base_calculo = todas["Amortizacion"];
            const cuota_con_ajuste = todas["Amortizacion"];
            const diferencia = -cuota_con_ajuste;

            cuota = {
                ICC,
                Ajuste_ICC,
                Base_calculo,
                cuota_con_ajuste,
                diferencia,
                parcialidad
            };
        } else {
            const anterior = await pool.query(
                'SELECT * FROM cuotas WHERE nro_cuota = ? AND cuil_cuit = ? AND id_lote = ?',
                [nro_cuota - 1, cuil_cuit, todas["id_lote"]]
            );

            let Saldo_real_anterior = parseFloat(anterior[0]["Saldo_real"]);
            const saldo_inicial = Saldo_real_anterior;
            const cuota_con_ajuste_anterior = parseFloat(anterior[0]["cuota_con_ajuste"]);

            const Base_calculo = cuota_con_ajuste_anterior;
            const Ajuste_ICC = (cuota_con_ajuste_anterior * ICC).toFixed(2);
            const cuota_con_ajuste = (cuota_con_ajuste_anterior + parseFloat(Ajuste_ICC)).toFixed(2);

            Saldo_real_anterior = (Saldo_real_anterior + parseFloat(Ajuste_ICC));
            Saldo_real = Saldo_real_anterior.toFixed(3);

            const diferencia = -cuota_con_ajuste;

            cuota = {
                ICC,
                Ajuste_ICC,
                Base_calculo,
                cuota_con_ajuste,
                Saldo_real,
                parcialidad,
                diferencia,
                saldo_inicial
            };
        }

        await pool.query('UPDATE cuotas SET ? WHERE id = ?', [cuota, todas["id"]]);
        const todass = await pool.query('SELECT * FROM cuotas WHERE id_lote = ?', [todas["id_lote"]]);

        if (todass.length > todas['nro_cuota']) {
            let cuotaa;
            if (todas['nro_cuota'] > 1) {
                cuotaa = {
                    saldo_inicial: cuota.Saldo_real,
                    Saldo_real: cuota.Saldo_real
                };
            } else {
                cuotaa = {
                    saldo_inicial: Saldo_real,
                    Saldo_real
                };
            }

            await pool.query('UPDATE cuotas SET ? WHERE id_lote = ? AND nro_cuota > ?', 
                [cuotaa, todas["id_lote"], todas["nro_cuota"]]);
        }
        
        return cuota.cuota_con_ajuste; // Retornar cuota_con_ajuste

    } catch (error) {
        console.error(error);
        return null;
    }
}


 


  





exports.calcularicc = calcularicc