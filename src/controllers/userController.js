import { User } from "../models/userModel.js";
import {
  createRank,
  deleteUserRank,
} from "../controllers/userRankController.js";
import fs from "fs";
import { UserRank } from "../models/userRankModel.js";
import { Camp } from "../models/campModel.js";
import { CampAttendance } from "../models/campAttendanceModel.js";
import { BoardOfReviewSchedule } from "../models/boardOfReviewScheduleModel.js";
import { UserQuizAnswerAttempt } from "../models/userQuizAnswerAttemptModel.js";
import { sendEmail } from "../utlis/sendEmail.js";
import mongoose from "mongoose";

const checkDuplicateUser = async (userId, name, email) => {
  const existingUser = await User.findOne({
    $or: [{ name: name }, { email: email }],
    _id: { $ne: userId }, // * exclude the current user's document from the check
  });

  return existingUser;
};

// * removing the image in uploads folder
const removeImage = (image) => {
  const filePath = "public/images/" + image;
  fs.unlink(filePath, (err) => {
    if (err) console.error("Failed to delete file:", err);
  });
};

// * read User
const getUser = async (req, res) => {
  try {
    const userId = req.params.id; // Get the user ID from the request params

    // First, find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Now, aggregate to look up the userRank data
    const userWithRank = await User.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(userId) }, // Match the user by ID
      },
      {
        $lookup: {
          from: "userranks", // Name of the UserRank collection
          localField: "_id", // Field in the User model
          foreignField: "userId", // Field in the UserRank model
          as: "userRank", // Alias for the joined data
        },
      },
    ]);

    // If no userRank found, add it as an empty array
    if (!userWithRank || userWithRank.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "UserRank not found for this user" });
    }

    res.json({ success: true, user: userWithRank[0] }); // Return the user with userRank
    // const user = await User.findById(req.params.id);
    // if (!user) {
    //   return res.status(404).json({ error: "User not found" });
    // }

    // const retrievedRank = await UserRank.findOne({ userId: req.params.id });
    // let userRank = null;

    // if (!userRank) {
    //   userRank = "unranked";
    //   // return res.status(404).json({ error: "UserRank not found" });
    // } else {
    //   userRank = retrievedRank;
    // }

    // return res.json({
    //   success: "One user",
    //   user: { ...user._doc, userRank },
    // });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};

const retrieveAllUsers = async (match) => {
  // Aggregation pipeline
  const users = await User.aggregate([
    { $match: match }, // * Filter users
    {
      $lookup: {
        from: "userranks", // * Name of the UserRank collection
        localField: "_id", // * Field in the User model
        foreignField: "userId", // * Field in the UserRank model
        as: "userRank", // * Alias for the joined data
      },
    },
  ]);

  return users;
};

// * read Users
const getUsers = async (req, res) => {
  try {
    const { userLevel, status, school } = req.query;

    const match = {};
    if (userLevel) {
      match.userLevel = userLevel;
    }
    if (status) {
      match.status = status;
    }
    if (school) {
      match["additionalDetails.school"] = school;
    }

    // Aggregation pipeline
    // const users = await User.aggregate([
    //   { $match: match }, // * Filter users
    //   {
    //     $lookup: {
    //       from: "userranks", // * Name of the UserRank collection
    //       localField: "_id", // * Field in the User model
    //       foreignField: "userId", // * Field in the UserRank model
    //       as: "userRank", // * Alias for the joined data
    //     },
    //   },
    // ]);

    const users = await retrieveAllUsers(match);

    if (users.length === 0) {
      return res.status(404).json({ error: "Users not found" });
    }

    res.json({ success: "All users", users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// * login/signin
const login = async (req, res) => {
  try {
    const creds = req.body;

    // * validate the request body first before anything
    if (!creds.email || !creds.password) {
      return res.status(400).json({ error: "Missing required fields!" });
    }

    const user = await User.findOne({
      email: creds.email,
      password: creds.password,
    });

    // * if found, check the password
    if (!(user && user.password === creds.password)) {
      return res.status(401).json({ error: "Incorrect username or password!" });
    }

    // * if found, check the status of account
    if (user.status === "pending") {
      console.log(user.status);
      return res
        .status(401)
        .json({ error: "This account is not yet reviewed by the admin..." });
    }

    if (user.status === "declined") {
      return res
        .status(401)
        .json({ error: "This account approval was declined by the admin..." });
    }

    const userRank = await UserRank.findOne({ userId: user._id });

    return res.json({ success: "Login success!", user: user, userRank });
  } catch (err) {
    console.error("ERROR DURING LOGIN:", err);
    return res.status(500).json({ error: err.message });
  }
};

// * register user
const register = async (req, res) => {
  try {
    const { name, userLevel, email, password, additionalDetails, rank } =
      req.body;

    console.log(req.body);

    // * validate required fields
    if (!name || !userLevel || !email || !password || !additionalDetails) {
      return res.status(400).json({ error: "Required fields missing!" });
    }

    if (userLevel === "scout" && !rank) {
      return res.status(400).json({ error: "Required fields missing!" });
    }

    // * duplicate user
    const existingUser = await User.findOne({ name });
    if (existingUser) {
      return res.status(409).json({ error: "User already exists" });
    }

    // * duplicate on some info
    const hasDuplicate = await checkDuplicateUser(null, name, email);
    if (hasDuplicate) {
      return res.status(409).json({
        error: "User with the same name or email already exists.",
      });
    }

    // * register the user first
    const newUser = new User({
      name,
      userLevel,
      email,
      password,
      additionalDetails,
      status: userLevel === "unitLeader" ? "pending" : "approved",
    });

    // * then add their rank if they're a scout
    if (userLevel === "scout") {
      // const userRank = await createRank(newUser._id, rank, "pending");
      const userRank = await createRank(newUser._id, rank, "approved");
      if (!userRank) {
        return res.status(500).json({
          error:
            "An unexpected error occurred. Rank cannot be created right now.",
        });
      }

      // * then send the email
      await sendEmail(
        [email],
        "Account Creation",
        `Good day! Your account has been created, you can now login using your email and default password: ${password}`
      )
        .then(() => console.log("Email sent successfully"))
        .catch((err) => console.error("Failed to send email:", err));
    }

    await newUser.save();
    return res.status(201).json({ success: "User saved!" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

// * update User
const updateUser = async (req, res) => {
  try {
    let { name, userLevel, email, password, additionalDetails, status } =
      req.body;
    let image = null;

    // * Check if it's parsable
    try {
      additionalDetails = JSON.parse(additionalDetails);
      console.log("Parsed object:", additionalDetails);
    } catch (error) {
      additionalDetails = additionalDetails;
    }

    // * validate required fields
    if (
      !name ||
      !userLevel ||
      !email ||
      !password ||
      !additionalDetails ||
      !status
    ) {
      return res.status(400).json({ error: "Required fields missing!" });
    }

    // * duplicate on some info
    const hasDuplicate = await checkDuplicateUser(req.params.id, name, email);
    if (hasDuplicate) {
      return res.status(409).json({
        error: "User with the same name or email already exists.",
      });
    }

    let toBeUpdatedUser = {
      name,
      userLevel,
      email,
      password,
      additionalDetails,
      status,
    };

    const isImageChanged = req.body.imageChanged;
    if (isImageChanged == "true") {
      // * ensure the image was uploaded successfully
      if (!req.file || !req.file.filename) {
        return res
          .status(400)
          .json({ error: "Image upload failed or missing!" });
      }
      image = req.file.filename;
      if (!hasDuplicate) {
        // * only allow deletion of prev image if it is not detected as duplicate
        removeImage(req.body.prevImageString);
      }
      toBeUpdatedUser.image = image;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      toBeUpdatedUser,
      { new: true, runValidators: true }
    );

    if (userLevel === "unitLeader") {
      await sendEmail(
        [email],
        "Account Status",
        `Good day! Your account status has been updated to ${status}`
      )
        .then(() => console.log("Email sent successfully"))
        .catch((err) => console.error("Failed to send email:", err));
    }

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({ success: "User updated!" });
  } catch (error) {
    console.error(error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: error.message });
  }
};

// * delete User
const deleteUser = async (req, res) => {
  try {
    const userIdToDelete = req.params.id;
    // * delete user's information on other collections
    const deletedBoardOfReview = await BoardOfReviewSchedule.deleteMany({
      userId: new mongoose.Types.ObjectId(userIdToDelete),
    });
    if (!deletedBoardOfReview) {
      console.log("User's Schedule not found");
    }
    const deletedCampAttendance = await CampAttendance.deleteMany({
      users: new mongoose.Types.ObjectId(userIdToDelete),
    });
    if (!deletedCampAttendance) {
      console.log("User's Camp Attendance not found");
    }
    const deletedCamp = await Camp.deleteMany({
      $or: [
        { createdBy: new mongoose.Types.ObjectId(userIdToDelete) },
        { invitedUnitLeaders: new mongoose.Types.ObjectId(userIdToDelete) },
      ],
    });
    if (!deletedCamp) {
      console.log("User's Camp not found");
    }
    const deletedQuizAnswerAttempt = await UserQuizAnswerAttempt.deleteMany({
      userId: new mongoose.Types.ObjectId(userIdToDelete),
    });
    if (!deletedQuizAnswerAttempt) {
      console.log("User's Quiz Attempt not found");
    }
    const deletedUserRank = UserRank.deleteMany({
      userId: new mongoose.Types.ObjectId(userIdToDelete),
    });
    if (!deletedUserRank) {
      console.log("User's Rank not found");
    }
    // * finally delete the user
    const deletedUser = await User.findByIdAndDelete(userIdToDelete);
    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }
    if (deletedUser.image) {
      removeImage(deletedUser.image);
    }
    console.log("DELETED!");
    return res.status(201).json({ success: "User deleted!" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

export {
  login,
  register,
  updateUser,
  deleteUser,
  getUser,
  getUsers,
  retrieveAllUsers,
};
