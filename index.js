const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const nodemailer = require("nodemailer");
const PDFDocument = require("pdfkit");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080;
const JWT_SECRET = "Mine Secret Key"; // Change this in production
const allowedOrigins = [
  "https://canberra-express.vercel.app",
  "http://localhost:4000",
];
const _dirname = path.resolve();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Test Route
app.get("/", (req, res) => {
  res.send("Hello Backend");
});

// Booking Email Route
app.post("/send-booking-email", async (req, res) => {
  const {
    clientName,
    clientPhone,
    clientEmail,
    pickLocation,
    pickAddress,
    dropLocation,
    dropAddress,
    pickupDate,
    pickupTime,
    carName,
  } = req.body;

  if (
    !clientName ||
    !clientPhone ||
    !clientEmail ||
    !pickLocation ||
    !dropLocation ||
    !pickupDate ||
    !pickupTime ||
    !carName
  ) {
    return res.status(400).json({ message: "Missing required booking details." });
  }

  const generateInvoiceBuffer = () => {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument();
      const buffers = [];

      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });

      doc.fontSize(20).text("Booking Invoice", { align: "center" }).moveDown();
      doc.fontSize(12).text(`Client Name: ${clientName}`);
      doc.text(`Client Phone: ${clientPhone}`);
      doc.text(`Client Email: ${clientEmail}`);
      doc.text(`Pickup Location: ${pickLocation} - ${pickAddress}`);
      doc.text(`Drop Location: ${dropLocation} - ${dropAddress}`);
      doc.text(`Pickup Date & Time: ${pickupDate} at ${pickupTime}`);
      doc.text(`Car Selected: ${carName}`);
      doc.text("Thank you for choosing Canberra Express!", { align: "center", lineGap: 10 });

      doc.end();
    });
  };

  const invoiceBuffer = await generateInvoiceBuffer();

  const transporter = nodemailer.createTransport({
    secure: true,
    host: "smtp.gmail.com",
    port: 465,
    auth: {
      user: "canberraxpress@gmail.com",
      pass: process.env.PASSWORD || "hdmu nvlf wabi cfip",
    },
  });

  const clientMailOptions = {
    from: "Canberra Express <canberraxpress@gmail.com>",
    to: clientEmail,
    subject: "Your Booking Confirmation - Canberra Express",
    html: `
      <h2>Thank You for Your Booking!</h2>
      <p>Here are your booking details:</p>
      <ul>
        <li><strong>Client Name:</strong> ${clientName}</li>
        <li><strong>Client Phone:</strong> ${clientPhone}</li>
        <li><strong>Pickup:</strong> ${pickLocation} - ${pickAddress}</li>
        <li><strong>Drop-off:</strong> ${dropLocation} - ${dropAddress}</li>
        <li><strong>Date & Time:</strong> ${pickupDate} at ${pickupTime}</li>
        <li><strong>Car:</strong> ${carName}</li>
      </ul>
      <p>Your invoice is attached as a PDF.</p>
    `,
    attachments: [
      {
        filename: "Canberra-Express-Invoice.pdf",
        content: invoiceBuffer,
        contentType: "application/pdf",
      },
    ],
  };

  const adminMailOptions = {
    from: "Canberra Express <canberraxpress@gmail.com>",
    to: "azharelahi321@gmail.com",
    subject: "New Booking Alert - PDF Invoice Attached",
    html: `
      <h2>New Booking Details</h2>
      <ul>
        <li><strong>Client Name:</strong> ${clientName}</li>
        <li><strong>Client Email:</strong> ${clientEmail}</li>
        <li><strong>Client Phone:</strong> ${clientPhone}</li>
        <li><strong>Pickup:</strong> ${pickLocation} - ${pickAddress}</li>
        <li><strong>Drop:</strong> ${dropLocation} - ${dropAddress}</li>
        <li><strong>Date & Time:</strong> ${pickupDate} at ${pickupTime}</li>
        <li><strong>Car:</strong> ${carName}</li>
      </ul>
      <p>Invoice attached as PDF.</p>
    `,
    attachments: [
      {
        filename: "Client-Booking-Invoice.pdf",
        content: invoiceBuffer,
        contentType: "application/pdf",
      },
    ],
  };

  try {
    await transporter.sendMail(clientMailOptions);
    await transporter.sendMail(adminMailOptions);
    res.status(200).json({ message: "Emails with invoice sent successfully" });
  } catch (error) {
    console.error("Email error:", error);
    res.status(500).json({ message: "Email sending failed", error });
  }
});




// Start server
app.listen(PORT, () => {
  console.log("Server started on port", PORT);
});
