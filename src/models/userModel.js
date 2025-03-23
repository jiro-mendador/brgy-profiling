import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  userLevel: {
    type: String,
    enum: ["scout", "unitLeader", "superAdmin"],
    default: "scout",
  },
  image: { type: String, default: "defaultProfile.png" },
  email: { type: String, required: true, unique: true }, // * email should be unique
  password: { type: String, required: true },
  additionalDetails: {
    school: { type: String, required: true },
    scoutNumber: { type: String, default: null },
    dateOfMembership: { type: Date, default: Date.now },
  },
  status: {
    type: String,
    enum: ["pending", "approved", "declined"],
    default: "pending",
  },
});

export const User = mongoose.model("User", userSchema);
