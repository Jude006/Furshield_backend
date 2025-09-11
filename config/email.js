const nodemailer = require('nodemailer');
require('dotenv').config()

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_EMAIL, 
      pass: process.env.SMTP_PASSWORD 
    },
    tls: {
      rejectUnauthorized: false 
    }
  });

  const mailOptions = {
    from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: `<p>${options.message}</p>`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Email send error:', error);
    throw new Error(`Email could not be sent: ${error.message}`);
  }
};

module.exports = sendEmail;