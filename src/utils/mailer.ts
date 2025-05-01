import nodemailer from "nodemailer";
import  dotenv from "dotenv";
dotenv.config()

export const sendMail = async (to: string, subject: string, html: string) => {
  const transporter = nodemailer.createTransport({
    service: "gmail", // or your SMTP service
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Quotly" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};
