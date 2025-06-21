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
      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];

      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => resolve(Buffer.concat(buffers)));

      // Header
      doc
        .fillColor("#000")
        .fontSize(26)
        .font("Helvetica-Bold")
        .text("OZLYFT Booking Invoice", { align: "center" })
        .moveDown(0.5);

      doc
        .fontSize(14)
        .fillColor("#555")
        .text("Your Ride, Our Responsibility", { align: "center" })
        .moveDown(1.5);

      // Line separator
      doc
        .moveTo(50, doc.y)
        .lineTo(550, doc.y)
        .strokeColor("#CCCCCC")
        .stroke()
        .moveDown(1.5);

      // Booking details
      const labelStyle = { continued: true, underline: false };
      doc
        .font("Helvetica-Bold")
        .fontSize(12)
        .fillColor("#222")
        .text("Client Name: ", labelStyle);
      doc.font("Helvetica").text(clientName).moveDown(0.5);

      doc.font("Helvetica-Bold").text("Phone: ", labelStyle);
      doc.font("Helvetica").text(clientPhone).moveDown(0.5);

      doc.font("Helvetica-Bold").text("Email: ", labelStyle);
      doc.font("Helvetica").text(clientEmail).moveDown(0.5);

      doc.font("Helvetica-Bold").text("Pickup Address: ", labelStyle);
      doc.font("Helvetica").text(pickAddress).moveDown(0.5);

      doc.font("Helvetica-Bold").text("Drop-off Address: ", labelStyle);
      doc.font("Helvetica").text(dropAddress).moveDown(0.5);

      doc.font("Helvetica-Bold").text("Pickup Date & Time: ", labelStyle);
      doc
        .font("Helvetica")
        .text(`${pickupDate} at ${pickupTime}`)
        .moveDown(0.5);

      doc.font("Helvetica-Bold").text("Car Selected: ", labelStyle);
      doc.font("Helvetica").text(carName).moveDown(2);

      // Line separator
      doc
        .moveTo(50, doc.y)
        .lineTo(550, doc.y)
        .strokeColor("#EEEEEE")
        .stroke()
        .moveDown(1.5);

      // Thank You note
      doc
        .font("Helvetica-Oblique")
        .fontSize(13)
        .fillColor("#007BFF")
        .text("Thank you for choosing OZLYFT!", { align: "center" })
        .moveDown(0.5);

      doc
        .font("Helvetica")
        .fontSize(12)
        .fillColor("#333")
        .text("We wish you a comfortable and safe journey.", {
          align: "center",
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
      from: "OZLYFT <canberraxpress@gmail.com>",
      to: clientEmail,
      subject: "Your Booking Confirmation - OZLYFT",
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
      from: "OZLYFT Rentals <canberraxpress@gmail.com>",
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
