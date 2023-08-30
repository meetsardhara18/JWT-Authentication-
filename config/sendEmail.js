import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const transporter  = nodemailer.createTransport({
  service:process.env.EMAIL_HOST,
  port:587,
  secure: true,
  auth:{
    user:process.env.EMAIL_USER,
    pass:process.env.EMAIL_PASS
  }
})

export default transporter;