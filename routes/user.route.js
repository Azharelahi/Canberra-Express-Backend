import { Router } from "express";
import { getAllUsers, getUserById, addUser, deleteUser } from "../controllers/user.controller.js";
import { adminOnly } from "../middleware.js/adminOnly.js";

const userRouter = Router();

userRouter.get("/", adminOnly, getAllUsers);      // Fetch all users (admin only)
userRouter.get("/:id", getUserById);     // Fetch specific user
userRouter.post("/", addUser);           // Add new user
userRouter.delete("/:id", adminOnly, deleteUser);   // Delete specific user (admin only)

export default userRouter;
