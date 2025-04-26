const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/canberra-express-admin", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Define admin schema
const adminSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
});

// Create model
const Admin = mongoose.model("Admin", adminSchema);

// Function to create an admin
async function createAdmin() {
  const email = "azharelahi321@gmail.com"; // Admin email
  const plainPassword = "azhar123"; // Admin password (change this in production)

  // Check if admin already exists
  const existingAdmin = await Admin.findOne({ email });
  if (existingAdmin) {
    console.log("Admin already exists");
    return;
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  // Create new admin
  const newAdmin = new Admin({
    email,
    password: hashedPassword,
  });

  // Save the new admin to the database
  await newAdmin.save();
  console.log("Admin created successfully");
}

// Run the createAdmin function
// createAdmin();

// Export the Admin model for use in other files
module.exports = Admin;
