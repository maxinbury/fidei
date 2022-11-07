
const nodemailer = require("nodemailer");





async function enviarmail (email,asunto,encabezado,mensaje) {
  console.log(email)
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
    
      console.log("Message sent: %s", info.messageId);
      // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
    
      // Preview only available when sending through an Ethereal account
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
      // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    
  }


  
  exports.enviarmail = enviarmail