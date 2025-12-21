import User from "../models/user.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "supersecretjwtkey";
const ADMIN_EMAIL = "azharelahi321@gmail.com";

// Login / Add user
export const loginUser = async (req, res) => {
  const { name, email } = req.body;
console.log("user recieved from front end is ",name)

  if (!name || !email) {
    return res.status(400).json({ message: "Name and email are required" });
  }

  try {


    let user = await User.findOne({ email });

    if (!user) {
      user = new User({ name, email }); // role defaults to user
      await user.save();
    }

    // JWT payload includes role
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.email === ADMIN_EMAIL ? "admin" : "user",
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({ user, token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all users (admin only)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get specific user
export const getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete user (admin only)
export const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
