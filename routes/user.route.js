import { Router } from "express";
import {
  loginUser,
  getAllUsers,
  getUserById,
  deleteUser
} from "../controllers/user.controller.js";
import { verifyToken, adminOnly } from "./../middleware.js/auth.middle.js";

const userRouter = Router();

// Public route – login / create user
userRouter.post("/login", loginUser);

// All routes below require authentication
userRouter.use(verifyToken);

// Admin-only routes
userRouter.get("/", adminOnly, getAllUsers);
userRouter.delete("/:id", adminOnly, deleteUser);

// Any authenticated user
userRouter.get("/:id", getUserById);

export default userRouter;
