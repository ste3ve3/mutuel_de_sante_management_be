import nodemailer from 'nodemailer';

const sender = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'ndicunguyesteve4@gmail.com',
    pass: process.env.NODEMAILER_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

function sendEmail({ to, subject, html }) {
  const mailOptions = {
    from: '"Magerwa VCC" <ndicunguyesteve4@gmail.com>',
    to,
    subject,
    html,
  };

  sender.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log('EMAILING SERVICE FAILED:', error.message);
    } else {
      console.log('Email Sent successfully,', email);
    }
  });
}

export { sendEmail };