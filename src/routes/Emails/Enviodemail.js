
const nodemailer = require("nodemailer");
const s3Controller = require('../configAWS/s3-controller');
const path = require('path')
const fs = require('fs');
const {correo} =require (('../../keys'))


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
        to: ["pipao.pipo@gmail.com",email], // list of receivers
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







  async function enviarmailsospechoso(email, asunto, encabezado, mensaje, ubicacion) {
    try {
    /*     let transporter = nodemailer.createTransport({
            host: "smtp-mail.outlook.com", // hostname
            port: 587, // port for secure SMTP
            secureConnection: false,
            tls: {
                ciphers: 'SSLv3'
            },
            auth: {
                user: 'fideicomisoSCatalina@outlook.com',
                pass: '1385Fideicomiso'
            }
        }); */
        const transporter = nodemailer.createTransport({
          service: 'gmail', // O el servicio de correo que utilices
          auth: {
            user: correo.mail, // Reemplaza con tu correo
            pass: correo.token // Reemplaza con tu contraseña
          }
        });
        // Ruta completa del archivo PDF
        const filePath = path.join(__dirname, '../../documentos', ubicacion);

        // Verificar si el archivo PDF existe
        let attachments = [
            {   // imagen del logotipo adjunta
                filename: 'marcas.png',
                path: path.join(__dirname, "../Emails/img/marcas.png"),
                cid: "logo"
            }
        ];

        if (fs.existsSync(filePath)) {
            attachments.push({
                filename: path.basename(filePath),
                path: filePath
            });
        } else {
            console.warn(`El archivo ${filePath} no existe.`);
        }

        // Enviar correo con objeto de transporte definido
        let info = await transporter.sendMail({
            from: '"Administracion Fideicomiso Santa Catalina" <fideicomisoSCatalina@outlook.com>', // dirección de envío 
            to: [email], // lista de receptores
            subject: asunto, // línea de asunto
            text: encabezado, // cuerpo del texto sin formato
            attachments: attachments,
            html: `<b>${mensaje}</b><br/><br/><img style='position:absolute;height:10%;width:10%' src='cid:logo'>` // cuerpo HTML
        });

        console.log('Email sent: ' + info.response);
    } catch (error) {
        console.log(error);
    }
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

    


  async function enviarmailicc(email, asunto, encabezado, mensaje, ubicacion) {
    try {
    /*     let transporter = nodemailer.createTransport({
            host: "smtp-mail.outlook.com", // hostname
            port: 587, // port for secure SMTP
            secureConnection: false,
            tls: {
                ciphers: 'SSLv3'
            },
            auth: {
                user: 'fideicomisoSCatalina@outlook.com',
                pass: '1385Fideicomiso'
            }
        }); */
        const transporter = nodemailer.createTransport({
          service: 'gmail', // O el servicio de correo que utilices
          auth: {
            user: correo.mail, // Reemplaza con tu correo
            pass: correo.token // Reemplaza con tu contraseña
          }
        });
        // Ruta completa del archivo PDF
        const filePath = path.join(__dirname, '../../documentos', ubicacion);

        // Verificar si el archivo PDF existe
        let attachments = [
            {   // imagen del logotipo adjunta
                filename: 'marcas.png',
                path: path.join(__dirname, "../Emails/img/marcas.png"),
                cid: "logo"
            }
        ];

        if (fs.existsSync(filePath)) {
            attachments.push({
                filename: path.basename(filePath),
                path: filePath
            });
        } else {
            console.warn(`El archivo ${filePath} no existe.`);
        }

        // Enviar correo con objeto de transporte definido
        let info = await transporter.sendMail({
            from: '"Administracion Fideicomiso Santa Catalina" <fideicomisoSCatalina@outlook.com>', // dirección de envío 
            to: [email], // lista de receptores
            subject: asunto, // línea de asunto
            text: encabezado, // cuerpo del texto sin formato
            attachments: attachments,
            html: `<b>${mensaje}</b><br/><br/><img style='position:absolute;height:10%;width:10%' src='cid:logo'>` // cuerpo HTML
        });

        console.log('Email sent: ' + info.response);
    } catch (error) {
        console.log(error);
    }
}


  exports.enviarmail = {enviarmail,enviarmailsospechoso,enviarmailRecupero}



