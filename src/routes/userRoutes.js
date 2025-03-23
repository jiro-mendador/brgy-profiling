import express from "express";
import multer from "multer";

import {
  register,
  login,
  updateUser,
  deleteUser,
  getUser,
  getUsers,
} from "../controllers/userController.js";

let userRoutes = express.Router();

// * setup multer for uploading images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images"); // * ensure "uploads" directory exists
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, `${uniqueSuffix}${file.originalname}`);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // * limit files to 5MB
  fileFilter: (req, file, cb) => {
    // * accept only specific file types
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error("Invalid file type. Only JPEG, PNG, and JPG are allowed."),
        false
      );
    }
  },
});

// * Middleware to check if file is missing
// const checkFile = (req, res, next) => {
//   if (!req.file) {
//     let response = {};
//     response.error = "Image upload failed or missing!";
//     return res.status(400).json(response);
//   }
//   next();
// };

const checkFile = (req, res, next) => {
  if (!req.file) {
    // * Optional check if the route needs an image or not
    if (req.method === "PUT" && req.route.path === "/:id") {
      // * No file required for user update
      return next();
    }
    let response = {};
    response.error = "Image upload failed or missing!";
    return res.status(400).json(response);
  }
  next();
};

userRoutes.post("/login", login);
userRoutes.post("/", register);

userRoutes.get("/", getUsers);
userRoutes.get("/:id", getUser);

userRoutes.put("/:id", upload.single("image"), updateUser);
// userRoutes.delete("/:id", upload.single("image"), deleteUser);
userRoutes.delete("/:id", deleteUser);

export { userRoutes };
