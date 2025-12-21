import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import "dotenv/config";

import { connectMongo } from "./config/db.js";
// dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080;
const allowedOrigins = [
  "https://www.ozlyft.com.au",
  "https://canberra-express.vercel.app",
  "http://localhost:4000",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

app.use(express.json());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.get("/", (req, res) => {
  res.send("Ozlyft Backend is running");
});

app.post("/send-booking-email", async (req, res) => {
  try {
    const {
      clientName,
      clientPhone,
      clientEmail,
      pickAddress,
      dropAddress,
      pickupDate,
      pickupTime,
      carName,
    } = req.body;

    if (
      !clientName ||
      !clientPhone ||
      !clientEmail ||
      !pickAddress ||
      !dropAddress ||
      !pickupDate ||
      !pickupTime ||
      !carName
    ) {
      return res.status(400).json({ message: "Missing required booking details." });
    }

    console.log("📦 Booking data received for:", clientName);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "ozlyft@gmail.com",
        pass: process.env.PASSWORD,
      },
    });

    // ✉️ CLIENT EMAIL
    const clientMail = {
      from: "OZLYFT 🚖 <ozlyft@gmail.com>",
      to: clientEmail,
      subject: `🎉 Your OZLYFT Booking Confirmation — ${pickupDate}`,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #fafafa; padding: 25px; border-radius: 10px;">
          <h2 style="color: #222;">Hey ${clientName}! 👋</h2>
          <p style="font-size: 16px; color: #444;">
            Thank you for booking with <strong>OZLYFT</strong> 🚖. We're thrilled to have you on board!
          </p>

          <div style="background-color: #fff; padding: 15px 20px; border: 1px solid #eee; border-radius: 8px; margin-top: 10px;">
            <h3 style="color: #ffcc00;">📅 Booking Details</h3>
            <ul style="list-style: none; padding-left: 0; line-height: 1.7;">
              <li><strong>🚗 Car:</strong> ${carName}</li>
              <li><strong>📍 Pickup:</strong> <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pickAddress)}" target="_blank" style="color:#007BFF;">${pickAddress}</a></li>
              <li><strong>🎯 Drop-off:</strong> <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(dropAddress)}" target="_blank" style="color:#007BFF;">${dropAddress}</a></li>
              <li><strong>🕒 Date & Time:</strong> ${pickupDate} at ${pickupTime}</li>
              <li><strong>📞 Contact:</strong> ${clientPhone}</li>
            </ul>
          </div>

          <p style="margin-top: 20px; font-size: 15px; color: #444;">
            We'll reach out shortly to confirm your booking. Get ready for a smooth, comfortable ride! 🌟
          </p>

          <p style="margin-top: 20px; font-size: 14px; color: #777;">
            Safe travels,<br>
            <strong>The OZLYFT Team 🚖</strong><br>
            <a href="https://www.ozlyft.com.au" style="color:#007BFF;">www.ozlyft.com.au</a>
          </p>
        </div>
      `,
    };

    // ✉️ ADMIN EMAIL
    const adminMail = {
      from: "OZLYFT 🚖 <ozlyft@gmail.com>",
      to: "ehsan_elahi1992@hotmail.com",
      cc: "azharelahi321@gmail.com, farhanelahi123@gmail.com",
      subject: `📩 New Booking Received — ${clientName} (${pickupDate})`,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #fefefe; padding: 20px; border-radius: 8px;">
          <h2 style="color: #000;">🚨 New Booking Alert!</h2>
          <p style="font-size: 15px; color: #444;">A new booking has just been received via OZLYFT:</p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <tr><td style="padding: 8px;"><strong>👤 Name:</strong></td><td>${clientName}</td></tr>
            <tr><td style="padding: 8px;"><strong>📧 Email:</strong></td><td>${clientEmail}</td></tr>
            <tr><td style="padding: 8px;"><strong>📞 Phone:</strong></td><td>${clientPhone}</td></tr>
            <tr><td style="padding: 8px;"><strong>📍 Pickup:</strong></td><td>${pickAddress}</td></tr>
            <tr><td style="padding: 8px;"><strong>🎯 Drop-off:</strong></td><td>${dropAddress}</td></tr>
            <tr><td style="padding: 8px;"><strong>🗓️ Date & Time:</strong></td><td>${pickupDate} at ${pickupTime}</td></tr>
            <tr><td style="padding: 8px;"><strong>🚗 Car Selected:</strong></td><td>${carName}</td></tr>
          </table>

          <p style="margin-top: 15px; font-size: 14px; color: #777;">
            📅 Received on: <strong>${new Date().toLocaleString()}</strong>
          </p>

          <p style="margin-top: 20px; font-size: 14px; color: #444;">
            — OZLYFT Booking System 🚖
          </p>
        </div>
      `,
    };

    console.log("📧 Sending client and admin emails...");
    await Promise.all([
      transporter.sendMail(clientMail),
      transporter.sendMail(adminMail),
    ]);

    console.log("✅ Both emails sent successfully.");
    return res.status(200).json({ message: "Emails sent successfully." });
  } catch (error) {
    console.error("🚨 Email Sending Error:", error.message);
    res.status(500).json({ message: "Failed to send emails." });
  }
});

app.listen(PORT, async() => {console.log(`Server running on port ${PORT}`)

await connectMongo();

});
