// server/utils/sendEmail.js
const nodemailer = require('nodemailer');
require('dotenv').config();

const sendEmail = async (to, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Your 16-character App Password
      },
    });

    const mailOptions = {
      from: `"Campus Portal" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: 'Your OTP for Campus Portal',
      html: `
        <div style="font-family: Arial, sans-serif; text-align: center;">
          <h2>Verify Your Account</h2>
          <p>Thank you for registering. Use the OTP below to complete your setup:</p>
          <h1 style="color: #4A90E2; letter-spacing: 5px;">${otp}</h1>
          <p>This code expires in 10 minutes.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully to:", to);
  } catch (error) {
    console.error("Email send failed:", error);
    throw new Error("Email could not be sent");
  }
};

module.exports = sendEmail;