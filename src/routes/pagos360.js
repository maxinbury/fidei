const http = require('http');
const https = require('https');
const {apiKey360} =require (('../keys'))
const axios = require('axios');
const express = require('express')
const router = express.Router()
const pool = require('../database')








//////////generar el
router.get('/traerlink360/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
      let cuota = await pool.query('select * from cuotas where id  = ?', [id]);
      let pagador = await pool.query('select * from clientes where cuil_cuit= ?', [cuota[0]['cuil_cuit']]);
  
      const monto = cuota[0]['cuota_con_ajuste'];
  
      const fechaActual = new Date();
      const ultimoDiaDelMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth() + 1, 0);
      const dia = ultimoDiaDelMes.getDate();
      const mes = ultimoDiaDelMes.getMonth() + 1;
      const año = ultimoDiaDelMes.getFullYear();
      const fechaFormateada = `${dia < 10 ? '0' : ''}${dia}-${mes < 10 ? '0' : ''}${mes}-${año}`;
  
      let newLink = {
        link_pago: "",
        vencimiento_l: "",
      };
  
      const data = JSON.stringify({
        payment_request: {
          description: cuota[0]['mes']+'/'+cuota[0]['anio'],
          first_due_date: fechaFormateada,
          first_total: monto,
          payer_name: pagador[0]['Nombre'],
        },
      });
  
      const options = {
        hostname: 'api.sandbox.pagos360.com',
        path: '/payment-request',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + apiKey360,
        },
      };
  
      // Utiliza una Promesa para manejar la asincronía
      const responseBody = await new Promise((resolve, reject) => {
        const requ = https.request(options, (res) => {
          let responseBody = '';
  
          res.on('data', (chunk) => {
            responseBody += chunk;
          });
  
          res.on('end', () => {
            resolve(responseBody);
          });
        });
  
        requ.on('error', (error) => {
          reject(error);
        });
  
        requ.write(data);
        requ.end();
      });
  
      newLink = {
        link_pago: JSON.parse(responseBody).checkout_url,
        vencimiento_l: JSON.parse(responseBody).first_due_date,
      };
  
      await pool.query('UPDATE cuotas set ? WHERE id = ?', [newLink, id]);
  
      console.log(newLink);
      res.json(newLink.link_pago);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });





// Ruta para la creación de adhesiones
router.post('/crearadhesiondeb', async(req, res) => {
    const adhesionData1 = req.body;
console.log('asas')
    const adhesionData = {
        adhesion_holder_name: "Juan Torres",
        email: "noemail@pagos360.com",
        description: "Descripción o concepto de la Adhesión",
        short_description: "hola mundo",
        external_reference: "72HD6FS1",
        cbu_number: "5100120000000001",
        cbu_holder_name: "Juan Torres",
        cbu_holder_id_number: 123
      };

    const apiUrl = 'https://api.sandbox.pagos360.com/adhesion';
  
    axios.post(apiUrl, { adhesion: adhesionData }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey360}`
      }
    })
      .then(response => {
        res.json({ success: true, message: 'Adhesión creada exitosamente', data: response.data });
      })
      .catch(error => {
        res.status(error.response ? error.response.status : 500).json({ success: false, message: 'Error al crear la adhesión', error: error.response ? error.response.data : error.message });
      });
  });





  router.post('/notificaciondebhook', async (req, res) => {
    const {external_reference, adhesion_holder_name,email } = req.body

    console.log(external_reference, adhesion_holder_name,email)
   

   

})
module.exports = router
