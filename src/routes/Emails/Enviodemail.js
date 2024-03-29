
const nodemailer = require("nodemailer");
const s3Controller = require('../configAWS/s3-controller');
const path = require('path')



async function enviarmail (email,asunto,encabezado,mensaje) {

  try {
    let transporter = nodemailer.createTransport({
        host: "smtp-mail.outlook.com", // hostname
        port: 587, // port for secure SMTP
        secureConnection: false,
        tls: {
           ciphers:'SSLv3'
        },
        auth: {
            user: 'fideicomisoSCatalina@outlook.com',
            pass: '1385Fideicomiso'
        }
    });
    const aux = "../Emails/img/marcas.png"
      // send mail with defined transport object
      let info = await transporter.sendMail({
        from: '"Administracion Fideicomiso Santa Catalina" <fideicomisoSCatalina@outlook.com>', // direccion de envio 
        to: ["elotroyo005@gmail.com","pipao.pipo@gmail.com",email], // list of receivers
        subject: asunto, // Subject line
        attachments: [
          {   // use URL as an attachment
            filename: 'marcas.png',
            path: (path.join(__dirname, aux)),
        cid: "logo"          }
        ],
        text: encabezado, // plain text body
        html: `<p><img  style='position:absolute;height:10%;width:10%'src = 'cid:logo'></img></p>
        <br>Gracias por leer este mensaje</b>
      
        <h2>  </h2>  <br/>
        <p>${mensaje} </p>
          ` // html body
      });
    
    
      // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
    
      // Preview only available when sending through an Ethereal account
   
      // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    }
    catch (error) { console.log(error)}
    
  }







  async function enviarmailsospechoso (email,asunto,encabezado,mensaje, ubicacion) {
   
    try { 
    // link = await s3Controller.traerImagen(ubicacion)
      let transporter = nodemailer.createTransport({
          host: "smtp-mail.outlook.com", // hostname
          port: 587, // port for secure SMTP
          secureConnection: false,
          tls: {
             ciphers:'SSLv3'
          },
          auth: {
              user: 'fideicomisoSCatalina@outlook.com',
              pass: '1385Fideicomiso'
          }
      });
      
        // send mail with defined transport object
        const auxx = "../Emails/img/marcas.png"
        let info = await transporter.sendMail({
          from: '"Administracion Fideicomiso Santa Catalina" <fideicomisoSCatalina@outlook.com>', // direccion de envio 
          to: [email], // list of receivers
          subject: asunto, // Subject line
          text: encabezado, // plain text body
          attachments: [
            {   // use URL as an attachment
              filename: 'marcas.png',
              path: (path.join(__dirname, auxx)),
          cid: "logo"          }
          ],
          html: "<b>  "+ mensaje+" </b><br/>"+"Descarga:"+ubicacion+"<br/> <br/> <br/>  `<img  style='position:absolute;height:10%;width:10%'src = 'cid:logo'></img>", // html body
        });
      
     
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
      
        // Preview only available when sending through an Ethereal account
        
        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
      }
      catch (error) {console.log(error) }
    }
  

    
  async function enviarmailRecupero (email,asunto,encabezado,mensaje) {

    try {
   

      let transporter = nodemailer.createTransport({
          host: "smtp-mail.outlook.com", // hostname
          port: 587, // port for secure SMTP
          secureConnection: false,
          tls: {
             ciphers:'SSLv3'
          },
          auth: {
              user: 'fideicomisoSCatalina@outlook.com',
              pass: '1385Fideicomiso'
          }
      });
      
        // send mail with defined transport object
        let info = await transporter.sendMail({
          from: '"Administracion Fideicomiso Santa Catalina" <fideicomisoSCatalina@outlook.com>', // direccion de envio 
          to: [email], // list of receivers
          subject: asunto, // Subject line
          text: encabezado, // plain text body
          html: "<b>  "+ mensaje+" </b>", // html body
        });
      
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
      
        // Preview only available when sending through an Ethereal account
        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
        mensaje ='Se envio un codigo a tu correo'
     
         
    } catch (error) {
  //    console.log(error)
      mensaje='Error el cliente no tiene mail'
    }
        return (mensaje)
      
    }
  exports.enviarmail = {enviarmail,enviarmailsospechoso,enviarmailRecupero}



