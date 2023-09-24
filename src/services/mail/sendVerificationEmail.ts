import nodemailer from 'nodemailer';
import fs from 'fs';

import config from '../../config';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: config.googleEmailSender,
    pass: config.googleAppPassword,
  },
});

const sendVerificationEmail = async (receiverEmail: string, emailHTMLTemplate: string): Promise<void> => {
  try {
    const template = fs.readFileSync('src/views/email/verification.html', 'utf-8');

    const message = {
      from: config.googleEmailSender,
      to: receiverEmail,
      subject: 'Verification Email MakansMinums',
      html: emailHTMLTemplate,
    };

    await transporter.sendMail(message);
  } catch (error: any) {
    console.log('Error sending email.');
    console.log(error);
  }
};

export default sendVerificationEmail;
