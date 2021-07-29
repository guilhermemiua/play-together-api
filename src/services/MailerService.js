const nodemailer = require('nodemailer');

const nodemailerConfig = require('../config/nodemailer');
const { getEnvPath } = require('../helpers');
require('dotenv').config({
  path: getEnvPath(),
});

class MailerService {
  constructor() {
    this.transport = nodemailer.createTransport(nodemailerConfig);
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
