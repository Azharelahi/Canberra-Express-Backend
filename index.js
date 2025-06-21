const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const PDFDocument = require("pdfkit");
const dotenv = require("dotenv");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080;

const allowedOrigins = [
  "https://www.ozlyft.com.au",
  "https://canberra-express.vercel.app",
  "http://localhost:4000",
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

app.get("/", (req, res) => {
  res.send("Canberra Express Backend is running");
});

app.post("/send-booking-email", async (req, res) => {
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
    return res
      .status(400)
      .json({ message: "Missing required booking details." });
  }

  const generateInvoiceBuffer = () => {
    return new Promise((resolve) => {
      const doc = new PDFDocument();
      const buffers = [];

      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => resolve(Buffer.concat(buffers)));

      doc.fontSize(20).text("Booking Invoice", { align: "center" }).moveDown();
      doc.fontSize(12).text(`Name: ${clientName}`);
      doc.text(`Phone: ${clientPhone}`);
      doc.text(`Email: ${clientEmail}`);
      doc.text(`Pickup Address: ${pickAddress}`);
      doc.text(`Drop-off Address: ${dropAddress}`);
      doc.text(`Date & Time: ${pickupDate} at ${pickupTime}`);
      doc.text(`Car: ${carName}`);
      doc.text("Thank you for choosing Canberra Express!", {
        align: "center",
        lineGap: 10,
      });

      doc.end();
    });
  };

  try {
    const invoiceBuffer = await generateInvoiceBuffer();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "canberraxpress@gmail.com",
        pass: process.env.PASSWORD,
      },
    });

    await transporter.sendMail({
      from: "Canberra Express <canberraxpress@gmail.com>",
      to: clientEmail,
      subject: "Your Booking Confirmation - Canberra Express",
      html: `
  <h2>Thank You for Your Booking!</h2>
  <p>Details:</p>
  <ul>
    <li><strong>Name:</strong> ${clientName}</li>
    <li><strong>Phone:</strong> ${clientPhone}</li>
    <li><strong>Pickup:</strong> <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      pickAddress
    )}" target="_blank">${pickAddress}</a></li>
    <li><strong>Drop-off:</strong> <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      dropAddress
    )}" target="_blank">${dropAddress}</a></li>
    <li><strong>Date & Time:</strong> ${pickupDate} at ${pickupTime}</li>
    <li><strong>Car:</strong> ${carName}</li>
  </ul>
  <p>Invoice attached.</p>
`,

      attachments: [{ filename: "Invoice.pdf", content: invoiceBuffer }],
    });

    await transporter.sendMail({
      from: "Canberra Express <canberraxpress@gmail.com>",
      to: "ehsan_elahi1992@hotmail.com",
      cc: "azharelahi321@gmail.com, farhanelahi123@gmail.com",

      subject: "New Booking - Invoice Attached",
      html: `
  <h2>New Booking Received</h2>
  <ul>
    <li><strong>Name:</strong> ${clientName}</li>
    <li><strong>Email:</strong> ${clientEmail}</li>
    <li><strong>Phone:</strong> ${clientPhone}</li>
    <li><strong>Pickup:</strong> <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      pickAddress
    )}" target="_blank">${pickAddress}</a></li>
    <li><strong>Drop-off:</strong> <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      dropAddress
    )}" target="_blank">${dropAddress}</a></li>
    <li><strong>Date & Time:</strong> ${pickupDate} at ${pickupTime}</li>
    <li><strong>Car:</strong> ${carName}</li>
  </ul>
`,

      attachments: [
        { filename: "Client-Booking-Invoice.pdf", content: invoiceBuffer },
      ],
    });

    res.status(200).json({ message: "Emails sent successfully." });
  } catch (error) {
    console.error("Email Error:", error);
    res.status(500).json({ message: "Failed to send emails.", error });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
