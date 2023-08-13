const nodemailer = require('nodemailer');

const sendEmail = async options => {
  // create a transporter

  //   const transporter = nodemailer.createTransport({
  //     service: 'Gmail', // Yahoo, Hotmail and others. Nodemailer could work with this service by default //SendGrid or MailGun
  //     auth: {
  //       user: process.env.EMAIL_USERNAME,
  //       password: process.env.EMAIL_PASSWORD
  //     }
  //   });

  const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_HOST,
    port: process.env.MAILTRAP_PORT,
    auth: {
      user: process.env.MAILTRAP_USER,
      pass: process.env.MAILTRAP_PASSWORD
    }
  });

  // 2. Define the email options
  const mailOptions = {
    from: 'Joel Ojerinde <joelojerinde@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message
    // html
  };

  // 3. Actually send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
