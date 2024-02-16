



const express = require('express')
const router = express.Router()
const pool = require('../../database')
const axios = require('axios');
const { apiKey360 } = require(('../../keys'))







async function debitoauomaticocbu (cuil_cuit) {
    console.log(cuil_cuit)
    const apiUrl = 'https://api.sandbox.pagos360.com/debit-request';
    const accessToken = apiKey360; // Reemplaza con tu token de autorización
    const deb = await pool.query("select * from adhesiones where external_reference=?",[cuil_cuit])
    ///////////////////////////Verificar cantidad
    console.log(deb[deb.length-1]['identificacion'])
    const requestData = {
      debit_request: {
        adhesion_id: deb[deb.length-1]['identificacion'],
        description: 'Concepto del Pago',
        first_due_date: '15-4-2024',
        first_total: 999
      }
    };
    
    axios.post(apiUrl, requestData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    })
      .then(async response => {
        console.log('Respuesta:', response.data);
        const nuevosolicitud={identificacion:response.data.id}
        await pool.query('insert into solicitudes_pagos360 set ?', nuevosolicitud)
        return(response)
      })
      .catch(error => {
        console.error('Error al hacer la solicitud:', error.response.data);
        //console.error( error.response.data.errors.children)
        return('Error al hacer la solicitud')
      });

}



async function estadopagodebito (id) {

    const apiUrl = `http://api.sandbox.pagos360.com/debit-request/${id}`;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey360}`
    };
  
    axios.get(apiUrl, { headers })
      .then(response => {
  
        console.log('Respuesta:', response.data);
        return response.data
      })
      .catch(error => {
        console.error('Error al realizar la solicitud:', error.response);
        return error.response
      });

}
exports.debitoauomaticocbu = debitoauomaticocbu
exports.estadopagodebito = estadopagodebito