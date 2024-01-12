
const nodemailer = require("nodemailer");
const secrets = require('../../keys.js');

// async..await is not allowed in global scope, must use a wrapper
async function main(mail,mensaje) {
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  let testAccount = await nodemailer.createTestAccount();

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp-mail.outlook.com", // hostname
    port: 587, // port for secure SMTP
    secureConnection: false,
    tls: {
       ciphers:'SSLv3'
    },
    ////////////////////////////
    auth: {
        user: secrets.auth.user,
        pass: secrets.auth.user
    }
});

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"  FSC" <fideicomisoSCatalina@outlook.com>', // sender address
    to: ["elotroyo005@outlook.com", mail], // list of receivers
    subject: "Buenas  tardes", // Subject line
    text: mensaje, // plain text body
    html: "<b> </b>", // html body
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}

main().catch(console.error);


exports.main = main

/* module.exports = {
  main
} */