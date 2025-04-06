import express from "express";

import {
  registerUser,
  deleteUser,
  getUser,
  getUsers,
  updateUser,
  getUserProfile,
  loginUser,
} from "../controllers/userController.js";

let userRoutes = express.Router();

userRoutes.post("/login/", loginUser);
userRoutes.post("/", registerUser);
userRoutes.get("/:id", getUser);
userRoutes.get("/", getUsers);
userRoutes.get("/profile/:id", getUserProfile);

userRoutes.put("/:id", updateUser);
userRoutes.delete("/:id", deleteUser);

export { userRoutes };
