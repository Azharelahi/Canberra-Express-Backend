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

      doc
        .moveTo(50, doc.y)
        .lineTo(550, doc.y)
        .strokeColor("#CCCCCC")
        .stroke()
        .moveDown(1.5);

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

      doc
        .moveTo(50, doc.y)
        .lineTo(550, doc.y)
        .strokeColor("#EEEEEE")
        .stroke()
        .moveDown(1.5);

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

  const generateAdminInvoiceBuffer = () => {
    return new Promise((resolve) => {
      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];

      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => resolve(Buffer.concat(buffers)));

      const bookingRef = `OZ-${Date.now()}`;

      doc
        .fillColor("#000")
        .fontSize(24)
        .font("Helvetica-Bold")
        .text("OZLYFT Booking - Admin Copy", { align: "center" })
        .moveDown(1);

      doc
        .fontSize(12)
        .font("Helvetica-Oblique")
        .fillColor("#444")
        .text(`Booking Reference: ${bookingRef}`, { align: "right" })
        .moveDown(0.5);

      doc
        .fontSize(12)
        .fillColor("#555")
        .text(`Generated on: ${new Date().toLocaleString()}`, {
          align: "right",
        })
        .moveDown(1);

      doc
        .moveTo(50, doc.y)
        .lineTo(550, doc.y)
        .strokeColor("#CCCCCC")
        .stroke()
        .moveDown(1);

      doc
        .font("Helvetica-Bold")
        .fontSize(12)
        .fillColor("#222")
        .text("Client Name:");
      doc.font("Helvetica").text(clientName).moveDown(0.5);

      doc.font("Helvetica-Bold").text("Client Email:");
      doc.font("Helvetica").text(clientEmail).moveDown(0.5);

      doc.font("Helvetica-Bold").text("Client Phone:");
      doc.font("Helvetica").text(clientPhone).moveDown(0.5);

      doc.font("Helvetica-Bold").text("Pickup Address:");
      doc.font("Helvetica").text(pickAddress).moveDown(0.5);

      doc.font("Helvetica-Bold").text("Drop-off Address:");
      doc.font("Helvetica").text(dropAddress).moveDown(0.5);

      doc.font("Helvetica-Bold").text("Pickup Date & Time:");
      doc
        .font("Helvetica")
        .text(`${pickupDate} at ${pickupTime}`)
        .moveDown(0.5);

      doc.font("Helvetica-Bold").text("Selected Car:");
      doc.font("Helvetica").text(carName).moveDown(2);

      doc
        .moveTo(50, doc.y)
        .lineTo(550, doc.y)
        .strokeColor("#EEEEEE")
        .stroke()
        .moveDown(1);

      doc
        .font("Helvetica-Oblique")
        .fontSize(11)
        .fillColor("#007BFF")
        .text("For internal use only. Please do not share with clients.", {
          align: "center",
        });

      doc.end();
    });
  };

  try {
    const invoiceBuffer = await generateInvoiceBuffer();
    const adminInvoiceBuffer = await generateAdminInvoiceBuffer();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "ozlyft@gmail.com",
        pass: process.env.PASSWORD,
      },
    });

    // Send to client
    await transporter.sendMail({
      from: "OZLYFT <ozlyft@gmail.com>",
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

    // Send to admin
    await transporter.sendMail({
      from: "OZLYFT <ozlyft@gmail.com>",
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
        { filename: "Admin-Copy-Invoice.pdf", content: adminInvoiceBuffer },
      ],
    });

    res.status(200).json({ message: "Emails sent successfully." });
  } catch (error) {
    console.error("Email Error:", error);
    res.status(500).json({ message: "Failed to send emails.", error });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
