const http = require('http');
const https = require('https');
const { apiKey360 } = require(('../keys'))
const axios = require('axios');
const express = require('express')
const router = express.Router()
const pool = require('../database')





router.get('/consultarestado/:id', async (req, res) => {


  const adhesionId = req.params.id; // Reemplaza 'tu_id' con el ID real de la adhesión
  const apiUrl = `http://api.sandbox.pagos360.com/adhesion/${adhesionId}`;
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey360}`
  };

  axios.get(apiUrl, { headers })
    .then(response => {

      console.log('Respuesta:', response.data);
      res.json(response.data)
    })
    .catch(error => {
      console.error('Error al realizar la solicitud:', error.response.data);
      res.json(error.response.data)
    });


})


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
        description: cuota[0]['mes'] + '/' + cuota[0]['anio'],
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




/////////////DEBITO CBU




router.post('/crearadhesiondebcbu', async (req, res) => {
  const {cuil_cuit, cbu_number,cbu_holder_name} = req.body;

  const adhesionData = {
    adhesion_holder_name: "Juan Torres",
    email: "noemail@pagos360.com",
    description: "Descripción o concepto de la Adhesión",
    short_description: "hola mundo",
    external_reference: cuil_cuit,
    cbu_number: cbu_number,
    cbu_holder_name: cbu_holder_name,
    cbu_holder_id_number: 123456
  };
  console.log(adhesionData)
  const apiUrl = 'https://api.sandbox.pagos360.com/adhesion';
  axios.post(apiUrl, { adhesion: adhesionData }, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey360}`
    }
  })
    .then(async response => {
      console.log(response.data)
      const nuevo = {
        banco: response.data.bank,
        estado: response.data.state,
        identificacion: response.data.id,
        fecha: response.data.created_at,
        external_reference: response.data.external_reference,
        cuil_cuit,

      }
      try {
        await pool.query('insert into adhesiones set ?', nuevo)

      } catch (error) {
        console.log(error)
      }
      console.log({ success: true, message: 'Adhesión creada exitosamente', data: response.data });
      res.json("Realizado correctamente" );

    })
    .catch(error => {
      console.log(error.response.data)
      console.log(error.response.data.errors.children)
      res.status(error.response ? error.response.status : 500).json({ success: false, message: 'Error al crear la adhesión', error: error.response ? error.response.data : error.message });
    });
});




// cancelar ahesion
router.post('/cancelaradhecioncbu', async (req, res) => {
  const {identificacion} = req.body;
/////identificacione s id de nuestra base de datos. se busca en adhesion apra buscar el valor de la identificacion de 360
const adhesion = await pool.query('select * from adhesiones where id=? ',[identificacion])
  if(adhesion[0]['tipo']=="CBU"){
     apiUrl = `https://api.sandbox.pagos360.com/adhesion/${adhesion[0]['identificacion']}/cancel`;
 }else{
   apiUrl =`https://api.sandbox.pagos360.com/card-adhesion/${adhesion[0]['identificacion']}/cancel`;
 }
   
 
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey360}`
  };

 await axios.put(apiUrl, null, { headers })
    .then(response => {
      console.log('Respuesta:', response.data);
      res.json('Realizado')
    })
    .catch(error => {
      

      console.log(error.response.request.res)
      console.error('Error al realizar la solicitud:', error.response.data);
      res.json('error')
    });
});



router.get('/listacbus360/:cuil_cuit', async (req, res) => {
  const { cuil_cuit } = req.params;

try {
  const listacbus = await pool.query('select * from adhesiones where cuil_cuit=?',[cuil_cuit])
let enviar = []
  for (ind in listacbus){



if(listacbus[ind]['tipo']=="CBU"){
   apiUrl = `http://api.sandbox.pagos360.com/adhesion/${listacbus[ind]['identificacion']}`;
}else{
  apiUrl = `https://api.sandbox.pagos360.com/card-adhesion/${listacbus[ind]['identificacion']}`;
}
    

   


    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey360}`
    };
    
  await  axios.get(apiUrl, { headers })
      .then(response => {
       // console.log('Respuesta:', response.data);
        let nu = {
          cuil_cuit,
          id:listacbus[ind]['id'],
          fecha:listacbus[ind]['fecha'],
          numero:listacbus[ind]['numero'],
          identificacion:listacbus[ind]['identificacion'],
         estado: response.data.state
        }
      enviar.push(nu)
      })
    
      .catch(error => {
        console.error('Error al realizar la solicitud:', error.response.data);
      });





  }
 
  res.json([enviar])
} catch (error) {
  res.json([{cuil_cuit:'error'}])
}


})



/////////SOLICITAR DEBITO
router.post('/crearsolicituddebito', async (req, res) => {
  const {cuil_cuit,id_cuota, cbu_number,cbu_holder_name} = req.body;

  const apiUrl = 'https://api.sandbox.pagos360.com/debit-request';
  const cuota = await pool.query ('select * from cuotas where id =?',[id_cuota])
  adhesionid = await pool.query ('select * from adhesiones where cuit_cuil= =?',[cuota[0]['cuil_cuit']])
  if (adhesionid.length>0){
  ///// controlar el debito q corresponda
  const requestData = {
    debit_request: {
      adhesion_id: adhesionid[0]['identificacion'],
      description: 'Concepto del Pago',
      first_due_date: '15-4-2024',
      first_total: cuota[0]['cuota_con_ajuste']
    }
  };
 
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${apiKey360}`
};

axios.post(apiUrl, requestData, { headers })
  .then(response => {
    console.log('Respuesta:', response.data);
    res.json(response.data)
  })
  .catch(error => {
    console.error('Error al realizar la solicitud:', error.response.data);
    console.error( error.response.data.errors.children);
    res.json(error.response.data)
  });
}else{ res.json('no tiene debito asociado confirmado')}
});















///////////////////////////////////////FIN DEBITO CBU












// Ruta para la creación de adhesiones en tarjeta
// erorr  'Referencia externa es requerida y debe ser una cadena de texto'
router.post('/crearadhesiondebtarjeta', async (req, res) => {
  const {card_number,CVV,cuil_cuit} = req.body;

 
  const apiUrl = 'https://api.sandbox.pagos360.com/card-adhesion';
  const requestData = {
    card_adhesion: {
      adhesion_holder_name: 'Juan Torres',
      external_reference:cuil_cuit,
      email: 'noemail@pagos360.com',
      card_holder_name: 'Juan Torres',
      card_number,
            description: 'Descripción o concepto de la Adhesión'
    }
  };
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey360}`
  };

await  axios.post(apiUrl, requestData, { headers })
    .then(async response => {
      console.log('Respuesta:', response.data);
      const nuevo = {
        banco: response.data.bank,
        estado: response.data.state,
        identificacion: response.data.id,
        fecha: response.data.created_at,
        tipo:"Tarjeta",
        last_four_digits:response.data.last_four_digits,
        card:response.data.card,
        external_reference: response.data.external_reference,
        cuil_cuit,

      }
      try {
        await pool.query('insert into adhesiones set ?', nuevo)

      } catch (error) {
       // console.log(error)
      }
    })
    .catch(error => {
 // console.log(error.response.data)

    //  console.error('Error al realizar la solicitud:', error.response.data.children);
    });
});






router.post('/notificaciondebhook', async (req, res) => {
  const { external_reference, adhesion_holder_name, email } = req.body

  console.log(external_reference, adhesion_holder_name, email)




})




module.exports = router
