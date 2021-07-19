const nodemailer = require('nodemailer');

const path = require('path');
const nodemailerConfig = require('../config/nodemailer');

require('dotenv').config({
  path:
    process.env.NODE_ENV === 'test'
      ? path.join(__dirname, '../../.env.test')
      : path.join(__dirname, '../../.env'),
});

class MailerService {
  constructor() {
    this.transport = nodemailer.createTransport(nodemailerConfig);

    this.transport.verify((error, success) => {
      if (error) {
        console.log(error);
      } else {
        console.log('Server is ready to take our messages');
      }
    });
  }

  async sendMail(to, title, text) {
    await this.transport.sendMail({
      from: process.env.MAILER_USER,
      to,
      subject: title,
      text,
    });
  }
}

module.exports = new MailerService();
