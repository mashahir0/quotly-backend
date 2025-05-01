import { Request, Response } from "express";
import crypto from "crypto";
import redisClient from "../../config/redis";
import { sendMail } from "../../utils/mailer";

export const sendOtp = async (req: Request, res: Response) => {
    try {

      const { email } = req.body;
  
      if (!email) return res.status(400).json({ error: "Email is required" });
  
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

    
      await redisClient.set(`otp:${email}`, otp, { EX: 300 }); // expires in 5 mins
  
      const html = `<p>Your OTP code is <b>${otp}</b>. It expires in 5 minutes.</p>`;

      await sendMail(email, "Your OTP Code", html);
  
      res.json({ message: "OTP sent to email." });
    } catch (error) {
      console.error("Error sending OTP:", error);
      res.status(500).json({ error: "Failed to send OTP. Please try again." });
    }
  };
  
  export const verifyOtp = async (req: Request, res: Response) => {
    try {
      const { email, otp } = req.body;
  
      if (!email || !otp)
        return res.status(400).json({ error: "Missing fields" });
  
      const storedOtp = await redisClient.get(`otp:${email}`);
  
      if (!storedOtp)
        return res.status(410).json({ error: "OTP expired or invalid" });
  
      if (storedOtp !== otp)
        return res.status(401).json({ error: "Incorrect OTP" });
      // After verifying OTP
      
      await redisClient.setEx(`verified:${email}`, 600, "true"); // valid for 10 mins

  
      await redisClient.del(`otp:${email}`); // Remove after verification
  
      res.json({ message: "OTP verified successfully" });
    } catch (error) {
      console.error("Error verifying OTP:", error);
      res.status(500).json({ error: "Failed to verify OTP. Please try again." });
    }
  };
