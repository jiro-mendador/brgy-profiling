import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["systemadmin", "staff", "user"],
    default: "user",
  },
  status: {
    type: String,
    enum: ["pending", "inactive"],
    default: "pending",
  },
  editorType: {
    type: String,
    enum: ["view_only", "add_only", "edit_only", "delete_only", "all"],
    default: "view_only",
  },
  permissions: { type: [String], default: [] },
});

// * function to dynamically assign permissions
const assignPermissions = (user) => {
  if (user.role === "systemadmin") {
    user.permissions = [
      "manage_users",
      "manage_system",
      "add",
      "edit",
      "delete",
      "view",
      "certificates",
    ];
  } else if (user.role === "staff") {
    const editorPermissions = {
      view_only: [],
      add_only: ["add"],
      edit_only: ["edit"],
      delete_only: ["delete"],
      all: ["add", "edit", "delete", "certificates"],
    };
    user.permissions = editorPermissions[user.editorType] || [];
  } else {
    user.permissions = ["view_only"];
  }
};

// * pre-save hook
userSchema.pre("save", function (next) {
  assignPermissions(this);
  next();
});

// * pre-update hook for `findOneAndUpdate`
userSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();
  if (update.role || update.editorType) {
    const user = await this.model.findOne(this.getQuery()); // Fetch current user
    if (user) {
      assignPermissions(update); // * assign new permissions
      this.setUpdate(update); // * apply updated permissions
    }
  }
  next();
});

export const User = mongoose.model("User", userSchema);
