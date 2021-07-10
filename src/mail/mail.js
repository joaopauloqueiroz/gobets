const nodemailer = require('nodemailer');

function getAuth () {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'psdovidro.pdf@gmail.com',
      pass: 'Psdovidro@10'
    }
  });
  return transporter;
}

async function sendEmail (message, email) { 
  return new Promise((resolve, reject) => {
    const mailOptions = {
      from: 'andre@psdovidro.com.br',
      to: email,
      subject: 'Confirmação de Pagamento Cielo',
      text: message
    };
    const transporter = getAuth();
  
   transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        reject("Error: " +error);
      } else {
        resolve('Email sent: ' + info.response);
      }
    });
  })
}


module.exports = {sendEmail}