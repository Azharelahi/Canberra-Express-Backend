const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();
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

    // --- Validation ---
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
      return res
        .status(400)
        .json({ message: "Missing required booking details." });
    }

    console.log("📦 Booking data received for:", clientName);

    // --- Setup Mail Transporter ---
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "ozlyft@gmail.com",
        pass: process.env.PASSWORD,
      },
    });

    // --- Client Email ---
    const clientMail = {
      from: "OZLYFT <ozlyft@gmail.com>",
      to: clientEmail,
      subject: "Your Booking Confirmation - OZLYFT",
      html: `
        <h2>Thank You for Your Booking!</h2>
        <p>Dear ${clientName}, here are your booking details:</p>
        <ul>
          <li><strong>Pickup:</strong> <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            pickAddress
          )}" target="_blank">${pickAddress}</a></li>
          <li><strong>Drop-off:</strong> <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            dropAddress
          )}" target="_blank">${dropAddress}</a></li>
          <li><strong>Date & Time:</strong> ${pickupDate} at ${pickupTime}</li>
          <li><strong>Car:</strong> ${carName}</li>
        </ul>
        <p>We’ll contact you shortly to confirm your booking. Thank you for choosing OZLYFT!</p>
      `,
    };

    // --- Admin Email ---
    const adminMail = {
      // to: "ehsan_elahi1992@hotmail.com", // cc: "azharelahi321@gmail.com, farhanelahi123@gmail.com",
      from: "OZLYFT <ozlyft@gmail.com>",
      to: "azharelahi321@gmail.com",
      subject: "New Booking Received - OZLYFT",
      html: `
        <h2>New Booking Received</h2>
        <ul>
          <li><strong>Name:</strong> ${clientName}</li>
          <li><strong>Email:</strong> ${clientEmail}</li>
          <li><strong>Phone:</strong> ${clientPhone}</li>
          <li><strong>Pickup:</strong> ${pickAddress}</li>
          <li><strong>Drop-off:</strong> ${dropAddress}</li>
          <li><strong>Date & Time:</strong> ${pickupDate} at ${pickupTime}</li>
          <li><strong>Car:</strong> ${carName}</li>
        </ul>
      `,
    };

    // --- Send Emails ---
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

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
