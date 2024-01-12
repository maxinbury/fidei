const express = require('express')
const router = express.Router()
const pool = require('../database')

const axios = require('axios');
const {apiKey360} =require (('../keys'))
//const apiUrl = 'https://api.sandbox.pagos360.com/payment-request';
const apiUrl = 'https://api.sandbox.pagos360.com/payment-request';

const apiKey = "NmRhMjNlYjE2ZGY2MGJjZGQ1MjFiMWFjYjk2OGYxMzI5OTEyN2ZiNTRhMjZlYzBhZWZhMDhhODY4ZGRlYzc3OA";

//const apiKey = "51541";




/* 
axios.post(apiUrl, requestData, {
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  }
})
  .then(response => {
    console.log(response.data);
  })
  .catch(error => {
    console.error(error);
  }); */

///////// reaxct
router.get("/prueba",  async (req, res) => {
    const requestData = {
        payment_request: {
          description: 'Pago a sandbox',
          first_due_date: '27-01-2024',
          first_total: 30.34,
          payer_name: 'Fernando'
        }
      };

  let resp = {}
   axios.post(apiUrl, requestData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      })
        .then(response => {
         
          resp=console.log(response.data);
        })
        .catch(error => {
         //   console.error("error");
         // console.error(error);
        })
    res.json(resp)
})

module.exports = router
