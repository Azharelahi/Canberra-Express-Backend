import mongoose from "mongoose";
//"mongodb://127.0.0.1:27017/ozlyftdb"
const MONGO_URI =
  process.env.MONGO_URI  || "mongodb+srv://azharelahi321:azhar1@cluster0.2w3ir.mongodb.net/ozlyftdb?retryWrites=true&w=majority";

let isConnected = false;

export const connectMongo = async () => {
  if (isConnected) return;

  try {
    await mongoose.connect(MONGO_URI);
    isConnected = true;
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  }
};

export default mongoose;
